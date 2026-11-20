import os
import re
import time
import pandas as pd
import logging
from typing import List, Dict, Any, Optional

try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None

from backend.config import Config
from backend.services.cache_service import cache_service
from backend.services.audit_service import audit_service

logger = logging.getLogger("lasa_guard.drug_service")

class DrugService:
    """
    Drug Data Service managing drug catalogs, interactions, and clinician overrides.
    Uses MongoDB with automatic CSV fallback if MongoDB is not running.
    """
    def __init__(self):
        self.db = self.connect_mongo()
        self._in_memory_drugs: List[Dict[str, Any]] = []
        self._in_memory_interactions: List[Dict[str, Any]] = []
        self._in_memory_overrides: List[Dict[str, Any]] = []
        self._load_csv_fallbacks()

    def connect_mongo(self):
        """Connect to MongoDB instance. If down, log exact warning message."""
        if not MongoClient:
            print("MongoDB not running. Run: docker-compose up mongodb")
            return None
        try:
            client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1500)
            client.server_info()  # Test connection
            logger.info("MongoDB connected successfully.")
            return client.get_database()
        except Exception:
            print("MongoDB not running. Run: docker-compose up mongodb")
            return None

    def _load_csv_fallbacks(self):
        """Load data/drugs.csv into memory for fallback operations."""
        drugs_csv = os.path.join(Config.DATA_DIR, "drugs.csv")
        if os.path.exists(drugs_csv):
            df = pd.read_csv(drugs_csv)
            for _, row in df.iterrows():
                self._in_memory_drugs.append({
                    "brand_name": str(row["brand_name"]),
                    "generic_name": str(row["generic_name"]),
                    "drug_class": str(row["drug_class"]),
                    "therapeutic_use": str(row["therapeutic_use"]),
                    "common_indications": [x.strip() for x in str(row["common_indications"]).split(",")],
                    "dosage_forms": ["Oral Tablet", "Solution", "Injection"],
                    "lasa_warnings": [],
                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                })
            logger.info(f"Loaded {len(self._in_memory_drugs)} fallback drugs from CSV.")

    def insert_drugs(self, list_of_dicts: List[Dict[str, Any]]) -> bool:
        """Bulk insert drug objects into database."""
        if self.db is not None:
            try:
                self.db.drugs.delete_many({})
                self.db.drugs.insert_many(list_of_dicts)
                cache_service.delete("all_drug_names")
                return True
            except Exception as e:
                logger.error(f"MongoDB insert error: {e}")
        self._in_memory_drugs = list_of_dicts
        cache_service.delete("all_drug_names")
        return True

    def find_drug(self, name: str) -> Optional[Dict[str, Any]]:
        """Case-insensitive search for a drug by brand_name or generic_name."""
        if not name:
            return None

        clean_name = name.strip()
        if self.db is not None:
            try:
                regex = re.compile(f"^{re.escape(clean_name)}$", re.IGNORECASE)
                doc = self.db.drugs.find_one({"$or": [{"brand_name": regex}, {"generic_name": regex}]})
                if doc:
                    doc.pop("_id", None)
                    return doc
            except Exception:
                pass

        # Fallback in-memory search
        for d in self._in_memory_drugs:
            if d["brand_name"].lower() == clean_name.lower() or d["generic_name"].lower() == clean_name.lower():
                return d
        return None

    def find_all_drug_names(self) -> List[str]:
        """Get list of distinct brand names with Redis caching."""
        cached = cache_service.get("all_drug_names")
        if cached:
            return cached

        names = []
        if self.db is not None:
            try:
                names = self.db.drugs.distinct("brand_name")
            except Exception:
                pass

        if not names:
            names = list({d["brand_name"] for d in self._in_memory_drugs if d.get("brand_name")})

        names.sort()
        cache_service.set("all_drug_names", names, ttl=1800)
        return names

    def log_interaction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Record drug check interaction log."""
        data["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        data["epoch"] = time.time()

        if self.db is not None:
            try:
                self.db.interactions.insert_one(data.copy())
            except Exception:
                pass

        self._in_memory_interactions.append(data)
        audit_service.log_event("DRUG_CHECK", data.get("user_id", "anonymous"), data)
        return data

    def get_recent_interactions(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent drug checks sorted descending by timestamp."""
        if self.db is not None:
            try:
                cursor = self.db.interactions.find({}, {"_id": 0}).sort("epoch", -1).limit(limit)
                results = list(cursor)
                if results:
                    return results
            except Exception:
                pass

        sorted_logs = sorted(self._in_memory_interactions, key=lambda x: x.get("epoch", 0), reverse=True)
        return sorted_logs[:limit]

    def log_override(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Log clinician risk override decision for audit trail."""
        data["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        data["epoch"] = time.time()

        if self.db is not None:
            try:
                self.db.overrides.insert_one(data.copy())
            except Exception:
                pass

        self._in_memory_overrides.append(data)
        audit_service.log_event("RISK_OVERRIDE", data.get("user_id", "anonymous"), data)
        return data

    def get_overrides_for_pair(self, drug1: str, drug2: str) -> List[Dict[str, Any]]:
        """Get historical override logs for specific drug pair."""
        d1, d2 = drug1.lower(), drug2.lower()
        if self.db is not None:
            try:
                cursor = self.db.overrides.find({
                    "$or": [
                        {"drug1": d1, "drug2": d2},
                        {"drug1": d2, "drug2": d1}
                    ]
                }, {"_id": 0})
                results = list(cursor)
                if results:
                    return results
            except Exception:
                pass

        matches = []
        for ov in self._in_memory_overrides:
            o1 = ov.get("drug1", "").lower()
            o2 = ov.get("drug2", "").lower()
            if (o1 == d1 and o2 == d2) or (o1 == d2 and o2 == d1):
                matches.append(ov)
        return matches

drug_service = DrugService()
