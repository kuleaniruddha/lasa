import json
import logging
from typing import Dict, Any

try:
    from kafka import KafkaProducer
except ImportError:
    KafkaProducer = None

logger = logging.getLogger("lasa_guard.kafka_producer")

class LASAKafkaProducer:
    """
    Kafka Producer for publishing real-time drug check and LASA alert events to 'lasa-events' topic.
    """
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self._init_producer()

    def _init_producer(self):
        if KafkaProducer:
            try:
                self.producer = KafkaProducer(
                    bootstrap_servers=self.bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                    request_timeout_ms=2000,
                    max_block_ms=2000
                )
                logger.info("Kafka Producer initialized successfully.")
            except Exception as e:
                logger.warning(f"Kafka Producer connection failed ({e}). Operating in in-memory event stream mode.")
                self.producer = None
        else:
            logger.warning("kafka-python library not available. Operating in in-memory event stream mode.")

    def send_event(self, event_data: Dict[str, Any], topic: str = "lasa-events") -> bool:
        """Publish event dictionary to Kafka topic."""
        if self.producer:
            try:
                self.producer.send(topic, event_data)
                self.producer.flush()
                return True
            except Exception as e:
                logger.error(f"Failed to publish event to Kafka: {e}")
                return False
        else:
            logger.info(f"[In-Memory Event]: Topic={topic}, Event={event_data.get('drug_name')}")
            return True
