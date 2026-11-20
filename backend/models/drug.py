from typing import List, Dict, Any

class Drug:
    """Drug data model matching FDA/ISMP schema."""
    def __init__(self, brand_name: str, generic_name: str, drug_class: str, therapeutic_use: str, common_indications: List[str] = None, dosage_forms: List[str] = None, lasa_warnings: List[Dict[str, Any]] = None):
        self.brand_name = brand_name
        self.generic_name = generic_name
        self.drug_class = drug_class
        self.therapeutic_use = therapeutic_use
        self.common_indications = common_indications or []
        self.dosage_forms = dosage_forms or ["Oral Tablet", "Solution"]
        self.lasa_warnings = lasa_warnings or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "brand_name": self.brand_name,
            "generic_name": self.generic_name,
            "drug_class": self.drug_class,
            "therapeutic_use": self.therapeutic_use,
            "common_indications": self.common_indications,
            "dosage_forms": self.dosage_forms,
            "lasa_warnings": self.lasa_warnings
        }
