import json
import pika
from pathlib import Path

INPUT_FILE = "input.json"
QUEUE_NAME = "reports"

# Load input.json
payload = json.loads(Path(INPUT_FILE).read_text(encoding="utf-8"))

# Connect to RabbitMQ
conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.queue_declare(queue=QUEUE_NAME, durable=True)

# Publish message
ch.basic_publish(
    exchange="",
    routing_key=QUEUE_NAME,
    body=json.dumps(payload),
)

conn.close()

print("✅ input.json sent to RabbitMQ")
