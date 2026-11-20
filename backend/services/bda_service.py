import time
from typing import Dict, Any
from backend.bda.bloom_filter import BloomFilter
from backend.bda.flajolet_martin import FlajoletMartin
from backend.bda.dgim import DGIM
from backend.bda.kafka_producer import LASAKafkaProducer

class BDAService:
    """
    Unified Big Data Analytics (BDA) service coordinating Bloom Filter,
    Flajolet-Martin distinct counting, and DGIM sliding-window stream analytics.
    """
    def __init__(self, kafka_bootstrap: str = "localhost:9092"):
        self.bloom_filter = BloomFilter(size=20000, num_hashes=7)
        self.flajolet_martin = FlajoletMartin(num_hashes=10)
        self.dgim = DGIM(window_size=60)
        self.producer = LASAKafkaProducer(bootstrap_servers=kafka_bootstrap)

    def record_check_event(self, drug_name: str, risk_level: str = "Low") -> Dict[str, Any]:
        """
        Record a drug check event across all BDA data stream algorithms:
        1. Check/Add to Bloom Filter
        2. Feed item to Flajolet-Martin for distinct element count
        3. Feed binary risk status (1 if High risk, 0 if Low/Medium) to DGIM
        4. Stream event to Kafka
        """
        timestamp = int(time.time())
        in_bloom = self.bloom_filter.contains(drug_name)
        
        # Add to Bloom filter & Flajolet-Martin
        self.bloom_filter.add(drug_name)
        self.flajolet_martin.add(drug_name)

        # DGIM window count (1 for High risk, 0 otherwise)
        bit = 1 if risk_level.upper() in ["HIGH", "HIGH RISK"] else 0
        self.dgim.add(bit, timestamp)

        # Publish to Kafka
        event_payload = {
            "drug_name": drug_name,
            "risk_level": risk_level,
            "timestamp": timestamp,
            "bloom_hit": in_bloom
        }
        self.producer.send_event(event_payload)

        return {
            "bloom_hit": in_bloom,
            "bloom_stats": self.bloom_filter.stats(),
            "flajolet_martin_stats": self.flajolet_martin.stats(),
            "dgim_stats": self.dgim.stats()
        }

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get aggregate real-time Big Data Analytics metrics for Admin Dashboard."""
        return {
            "bloom_filter": self.bloom_filter.stats(),
            "flajolet_martin": self.flajolet_martin.stats(),
            "dgim": self.dgim.stats()
        }

# Global BDA Service Instance
bda_service = BDAService()
