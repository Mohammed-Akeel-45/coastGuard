# send_test.py
import json
import pika

INPUT_FILE = "input.json"
QUEUE_NAME = "reports"

# Load input.json
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    payload = json.load(f)

print(f"[+] Loaded {len(payload)} items from input.json")

# Connect to RabbitMQ
conn = pika.BlockingConnection(
    pika.ConnectionParameters(host="localhost")
)
ch = conn.channel()

# Make sure queue exists
ch.queue_declare(queue=QUEUE_NAME, durable=True)

# Send message
ch.basic_publish(
    exchange="",
    routing_key=QUEUE_NAME,
    body=json.dumps(payload),
    properties=pika.BasicProperties(delivery_mode=2)
)

print(f"[✔] Sent input.json to '{QUEUE_NAME}'")

conn.close()