import json
import logging
import threading
import time
from typing import Dict, Any

try:
    from kafka import KafkaConsumer
except ImportError:
    KafkaConsumer = None

logger = logging.getLogger("lasa_guard.kafka_consumer")

class LASAKafkaConsumer:
    """
    Kafka Consumer subscribing to 'lasa-events' to continuously update real-time
    Flajolet-Martin distinct counting and DGIM high-risk sliding window count.
    """
    def __init__(self, bda_service, bootstrap_servers: str = "localhost:9092", topic: str = "lasa-events"):
        self.bda_service = bda_service
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.running = False
        self.consumer_thread = None

    def start(self):
        """Start consumer background thread."""
        if not KafkaConsumer:
            logger.warning("kafka-python not installed. Skipping Kafka background consumer thread.")
            return

        self.running = True
        self.consumer_thread = threading.Thread(target=self._consume_loop, daemon=True)
        self.consumer_thread.start()
        logger.info("Kafka consumer thread started.")

    def stop(self):
        """Stop consumer loop."""
        self.running = False

    def _consume_loop(self):
        try:
            consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',
                enable_auto_commit=True,
                consumer_timeout_ms=1000
            )
            logger.info(f"Subscribed to Kafka topic '{self.topic}'.")

            while self.running:
                for message in consumer:
                    if not self.running:
                        break
                    event = message.value
                    self.process_event(event)
                time.sleep(0.1)
        except Exception as e:
            logger.warning(f"Kafka consumer connection or execution error: {e}. Kafka background streaming inactive.")

    def process_event(self, event: Dict[str, Any]):
        """Feed incoming stream event to BDA algorithms (Flajolet-Martin + DGIM)."""
        drug_name = event.get("drug_name")
        risk_level = event.get("risk_level", "Low")
        timestamp = event.get("timestamp", int(time.time()))

        if drug_name and self.bda_service:
            # Update Flajolet-Martin
            self.bda_service.flajolet_martin.add(drug_name)

            # Update DGIM (1 if High risk, 0 otherwise)
            bit = 1 if risk_level in ["High", "HIGH"] else 0
            self.bda_service.dgim.add(bit, timestamp)
