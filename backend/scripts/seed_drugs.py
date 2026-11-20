import os
import json
import time
import pandas as pd
import logging
from backend.config import Config
from backend.services.drug_service import drug_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_drugs")

def seed_database():
    """Seed MongoDB or in-memory store with drugs.csv and lasa_pairs.csv."""
    drugs_csv_path = os.path.join(Config.DATA_DIR, "drugs.csv")
    lasa_csv_path = os.path.join(Config.DATA_DIR, "lasa_pairs.csv")

    if not os.path.exists(drugs_csv_path) or not os.path.exists(lasa_csv_path):
        logger.error(f"Missing dataset files in {Config.DATA_DIR}")
        return

    drugs_df = pd.read_csv(drugs_csv_path)
    lasa_df = pd.read_csv(lasa_csv_path)

    # Build mapping of lasa warnings per drug
    lasa_map = {}
    for _, row in lasa_df.iterrows():
        d1, d2, risk = str(row["drug1"]), str(row["drug2"]), str(row["risk_level"])
        lasa_map.setdefault(d1.lower(), []).append({"confused_with": d2, "risk_level": risk, "source": "ISMP/FDA"})
        lasa_map.setdefault(d2.lower(), []).append({"confused_with": d1, "risk_level": risk, "source": "ISMP/FDA"})

    drug_records = []
    for _, row in drugs_df.iterrows():
        bname = str(row["brand_name"]).strip()
        gname = str(row["generic_name"]).strip()
        warnings = lasa_map.get(bname.lower(), [])

        record = {
            "brand_name": bname,
            "generic_name": gname,
            "drug_class": str(row["drug_class"]).strip(),
            "therapeutic_use": str(row["therapeutic_use"]).strip(),
            "common_indications": [x.strip() for x in str(row["common_indications"]).split(",")],
            "dosage_forms": ["Oral Tablet", "Solution", "Injection"],
            "lasa_warnings": warnings,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        drug_records.append(record)

    drug_service.insert_drugs(drug_records)
    logger.info(f"Successfully seeded {len(drug_records)} drugs into system database.")

if __name__ == "__main__":
    seed_database()
