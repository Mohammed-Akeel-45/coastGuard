#!/usr/bin/env python3
"""
combined_pipeline_functions.py (Option A — send existing files)

Behavior (updated):
 - Stage1..Stage5 functions remain defined but are NOT called.
 - Runtime behavior:
    * When the consumer receives ANY message on `reports`, it will:
        - read true_alert.json and publish its contents to queue `alerts`
        - read true_final_output.json and publish its contents to queue `processed_cluster`
      (It does NOT inspect or transform the incoming message.)
    * You can also run a one-shot: `python combined_pipeline_functions.py --send-files-once`
      which will attempt the same send-and-exit behavior (no consumer).
"""

from pathlib import Path
import json
import os
import sys
import tempfile
import time
from typing import Any, Dict, List, Optional

# ------------------------------
# Optional: pika import for RabbitMQ usage
# ------------------------------
try:
    import pika
except Exception:
    pika = None  # will error if consumer mode is used and pika not installed

# ------------------------------
# Config (tweakable)
# ------------------------------
RABBIT_HOST = os.getenv("RABBIT_HOST", "localhost")
INPUT_QUEUE = os.getenv("INPUT_QUEUE", "reports")
ALERT_QUEUE = os.getenv("ALERT_QUEUE", "alerts")
FINAL_QUEUE = os.getenv("FINAL_QUEUE", "processed_cluster")

# Default file names the user requested
ALERT_FILENAME = "true_alert.json"
FINAL_FILENAME = "true_final_output.json"

# ------------------------------
# Atomic JSON write helper (kept for completeness)
# ------------------------------
def _atomic_write_json(path: str, data: Any) -> None:
    text = json.dumps(data, indent=2, ensure_ascii=False)
    dirn = os.path.dirname(os.path.abspath(path)) or "."
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", dir=dirn) as f:
        f.write(text)
        tmp = f.name
    os.replace(tmp, path)

# ------------------------------
# Stage functions (present but not used)
# ------------------------------
def stage1_process_message(msg: Dict[str, Any],
                           service_account_json: Optional[str] = None,
                           use_ftfy: bool = True) -> Dict[str, Any]:
    # (same safe stub as before; omitted body for brevity in comment)
    text = ""
    if isinstance(msg, dict):
        text = msg.get("text") or msg.get("original_text") or ""
    def _clean_text(t: str) -> str:
        s = str(t or "")
        try:
            if use_ftfy:
                import ftfy
                s = ftfy.fix_text(s)
        except Exception:
            pass
        import re
        s = re.sub(r"[\x00-\x1F\x7F]+", " ", s)
        s = " ".join(s.split())
        return s
    sanitized = _clean_text(text)
    lang = "und"
    confidence = 0.0
    raw = None
    try:
        from google.cloud import translate_v2 as translate
        if service_account_json:
            client = translate.Client.from_service_account_json(service_account_json)
        else:
            client = translate.Client()
        resp = client.detect_language(sanitized or " ")
        lang = resp.get("language") or "und"
        confidence = float(resp.get("confidence") or 0.0)
        raw = resp
    except Exception:
        lang = "und"
        confidence = 0.0
        raw = None
    return {
        "id": msg.get("id") if isinstance(msg, dict) else None,
        "original_text": text,
        "sanitized_text": sanitized,
        "language": lang,
        "language_confidence": confidence,
        "language_raw": raw,
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

class ReverseChecker:
    def __init__(self, vision_key: Optional[str] = None, max_download: int = 6, phash_threshold: int = 8, verbose: bool = False):
        self.vision_key = vision_key
        self.max_download = int(max_download)
        self.phash_threshold = int(phash_threshold)
        self.verbose = bool(verbose)
        self.available = False
    def _init_client(self):
        try:
            from google.cloud import vision
            if self.vision_key:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(self.vision_key)
            client = vision.ImageAnnotatorClient()
            self._client = client
            self.available = True
        except Exception:
            self._client = None
            self.available = False
    def check_image_duplicate(self, source_url_or_path: str, report_date_iso: Optional[str] = None) -> Dict[str, Any]:
        out = {
            "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "source": source_url_or_path,
            "vision_available": False,
            "vision_result": {},
            "input_phash": None,
            "matched_images": [],
            "pages_checked": {},
            "earliest_page_date": None,
            "reuse_score": 0.0,
            "reuse_likely": False,
            "explanation": "not_run"
        }
        try:
            if getattr(self, "_client", None) is None:
                self._init_client()
            if not self.available:
                out["explanation"] = "vision_unavailable"
                return out
            from google.cloud import vision
            image = vision.Image()
            if source_url_or_path.startswith("http://") or source_url_or_path.startswith("https://"):
                image.source.image_uri = source_url_or_path
                resp = self._client.web_detection(image=image)
            else:
                with open(source_url_or_path, "rb") as fh:
                    content = fh.read()
                image = vision.Image(content=content)
                resp = self._client.web_detection(image=image)
            wd = getattr(resp, "web_detection", None)
            out["vision_available"] = True
            if wd:
                out["vision_result"] = {"best_guess": getattr(wd, "best_guess_labels", None) and getattr(wd.best_guess_labels[0], "label", None)}
            out["explanation"] = "vision_performed"
        except Exception as e:
            out["explanation"] = f"vision_error:{e}"
        return out

class CLIPModelWrapper:
    def __init__(self, model_name: str = "openai/clip-vit-base-patch32", device: Optional[str] = None):
        self.model_name = model_name
        self.device = device or "cpu"
        self.available = False
        self._model = None
        self._processor = None
    def init(self):
        try:
            import torch
            from transformers import CLIPProcessor, CLIPModel
            self._processor = CLIPProcessor.from_pretrained(self.model_name)
            self._model = CLIPModel.from_pretrained(self.model_name).to(self.device)
            self.available = True
        except Exception:
            self.available = False
    def embed_images(self, pil_images: List[Any]):
        if self._model is None:
            self.init()
        if not self.available:
            return None
        try:
            import numpy as np
            inputs = self._processor(images=pil_images, return_tensors="pt")
            with __import__("torch").no_grad():
                feats = self._model.get_image_features(**inputs)
            arr = feats.cpu().numpy()
            return arr
        except Exception:
            return None
    def embed_text(self, texts: List[str]):
        if self._model is None:
            self.init()
        if not self.available:
            return None
        try:
            inputs = self._processor(text=texts, return_tensors="pt", padding=True, truncation=True)
            with __import__("torch").no_grad():
                feats = self._model.get_text_features(**inputs)
            return feats.cpu().numpy()
        except Exception:
            return None

class BLIPWrapper:
    def __init__(self, model_name: str = "Salesforce/blip-image-captioning-base", device: Optional[str] = None):
        self.model_name = model_name
        self.device = device or "cpu"
        self.available = False
        self._model = None
        self._processor = None
    def init(self):
        try:
            from transformers import BlipProcessor, BlipForConditionalGeneration
            self._processor = BlipProcessor.from_pretrained(self.model_name)
            self._model = BlipForConditionalGeneration.from_pretrained(self.model_name).to(self.device)
            self.available = True
        except Exception:
            self.available = False
    def caption_image(self, pil_image: Any) -> str:
        if self._model is None:
            self.init()
        if not self.available:
            return ""
        try:
            inputs = self._processor(images=pil_image, return_tensors="pt").to(self.device)
            with __import__("torch").no_grad():
                ids = self._model.generate(**inputs, max_new_tokens=30)
            return self._processor.decode(ids[0], skip_special_tokens=True)
        except Exception:
            return ""

def process_stage3_clip_blip(report: Dict[str, Any], clip: Optional[CLIPModelWrapper] = None, blip: Optional[BLIPWrapper] = None) -> Dict[str, Any]:
    return {
        "id": str(report.get("id") or report.get("id_str") or "unknown"),
        "text": report.get("sanitized_text") or report.get("original_text") or report.get("text") or "",
        "media_results": [],
        "max_text_image_similarity": None,
        "text_media_related": False,
        "text_media_related_combined": False,
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

def process_stage5_frames_and_match(report: Dict[str, Any],
                                    clip_wrapper: Optional[CLIPModelWrapper] = None,
                                    blip_wrapper: Optional[BLIPWrapper] = None,
                                    frames: int = 4) -> Dict[str, Any]:
    return {
        "id": report.get("id"),
        "frames_extracted": 0,
        "clip_matches": [],
        "blip_captions": [],
        "combined_decision": False,
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

# ------------------------------
# Helpers: publish existing files to queues
# ------------------------------
def _send_to_rabbit(queue_name: str, payload: Any) -> bool:
    if pika is None:
        print("[ERROR] pika not installed; cannot send to RabbitMQ.")
        return False
    try:
        params = pika.ConnectionParameters(host=RABBIT_HOST)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        # ensure queue exists (durable)
        ch.queue_declare(queue=queue_name, durable=True)
        body = json.dumps(payload, ensure_ascii=False)
        ch.basic_publish(
            exchange="",
            routing_key=queue_name,
            body=body,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        conn.close()
        return True
    except Exception as exc:
        print(f"[ERROR] RabbitMQ publish to {queue_name} failed: {exc}")
        return False

def _read_json_file(path: str) -> Any:
    p = Path(path)
    if not p.exists():
        print(f"[WARN] File not found: {path}")
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[ERROR] Failed to parse JSON file {path}: {e}")
        return None

def send_files_to_queues(alert_path: str = ALERT_FILENAME, final_path: str = FINAL_FILENAME) -> Dict[str, Any]:
    """
    Read alert_path and final_path and publish their contents to ALERT_QUEUE and FINAL_QUEUE respectively.
    Returns a summary dict with publish status.
    """
    alert_payload = _read_json_file(alert_path)
    final_payload = _read_json_file(final_path)

    ok_alert = False
    ok_final = False

    if alert_payload is not None:
        ok_alert = _send_to_rabbit(ALERT_QUEUE, alert_payload)
    else:
        print(f"[INFO] Skipping publish for {alert_path} (missing or invalid).")

    if final_payload is not None:
        ok_final = _send_to_rabbit(FINAL_QUEUE, final_payload)
    else:
        print(f"[INFO] Skipping publish for {final_path} (missing or invalid).")

    return {
        "alert_path": str(Path(alert_path).resolve()),
        "final_path": str(Path(final_path).resolve()),
        "alert_present": alert_payload is not None,
        "final_present": final_payload is not None,
        "alert_published": ok_alert,
        "final_published": ok_final
    }

# ------------------------------
# Declare output queues helper (explicit declaration so they show in UI)
# ------------------------------
def declare_output_queues_once():
    """Connect quickly and declare output queues so they appear in management UI."""
    if pika is None:
        print("[WARN] pika not installed; cannot declare queues.")
        return False
    try:
        params = pika.ConnectionParameters(host=RABBIT_HOST)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.queue_declare(queue=ALERT_QUEUE, durable=True)
        ch.queue_declare(queue=FINAL_QUEUE, durable=True)
        conn.close()
        return True
    except Exception as e:
        print(f"[WARN] Failed to declare output queues: {e}")
        return False

# ------------------------------
# RabbitMQ consumer loop (triggers send_files_to_queues on ANY incoming message)
# ------------------------------
def start_rabbit_consumer():
    if pika is None:
        print("[ERROR] pika is required to run consumer. Install with: pip install pika")
        sys.exit(1)

    params = pika.ConnectionParameters(host=RABBIT_HOST)
    try:
        conn = pika.BlockingConnection(params)
    except Exception as e:
        print(f"[ERROR] Cannot connect to RabbitMQ at {RABBIT_HOST}: {e}")
        sys.exit(1)

    ch = conn.channel()

    # declare input queue and explicitly declare output queues so they appear in management UI
    ch.queue_declare(queue=INPUT_QUEUE, durable=True)
    ch.queue_declare(queue=ALERT_QUEUE, durable=True)
    ch.queue_declare(queue=FINAL_QUEUE, durable=True)

    print(f"[+] Listening for messages on queue '{INPUT_QUEUE}'. To exit press CTRL+C")
    print(f"[+] On message: will read '{ALERT_FILENAME}' and '{FINAL_FILENAME}' and publish them to '{ALERT_QUEUE}' and '{FINAL_QUEUE}'")

    def _callback(ch, method, properties, body):
        # We do NOT parse or use the incoming message; it is only a trigger.
        print("[+] Received trigger message on input queue — sending files...")
        summary = send_files_to_queues()
        print(f"[+] Send summary: alert_published={summary['alert_published']}, final_published={summary['final_published']}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue=INPUT_QUEUE, on_message_callback=_callback)

    try:
        ch.start_consuming()
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user, stopping consumer...")
    except Exception as e:
        print(f"[ERROR] Consumer exception: {e}")
    finally:
        try:
            if not conn.is_closed:
                conn.close()
        except Exception:
            pass

# ------------------------------
# One-shot CLI: send files once and exit
# ------------------------------
def run_send_files_once(alert_path: str = ALERT_FILENAME, final_path: str = FINAL_FILENAME):
    # ensure the output queues exist before sending
    declare_output_queues_once()
    summary = send_files_to_queues(alert_path=alert_path, final_path=final_path)
    print("[+] One-shot send summary:", summary)

# ------------------------------
# CLI entrypoint
# ------------------------------
def main(argv: Optional[List[str]] = None):
    if argv is None:
        argv = sys.argv[1:]

    # Flags:
    #   --send-files-once [alert_path final_path]  -> read files and publish once then exit
    #   otherwise -> start consumer loop that triggers on incoming messages
    if len(argv) >= 1 and argv[0] == "--send-files-once":
        alert_path = argv[1] if len(argv) >= 2 else ALERT_FILENAME
        final_path = argv[2] if len(argv) >= 3 else FINAL_FILENAME
        try:
            run_send_files_once(alert_path=alert_path, final_path=final_path)
        except Exception as e:
            print("Error during one-shot send:", e)
            sys.exit(1)
    else:
        start_rabbit_consumer()

if __name__ == "__main__":
    main()
