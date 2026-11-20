"""
Merge datasets from Indian Pharmacopoeia + Lancet 2024 pairs 
and FDA 522 Formulary Drugs + 117 ISMP pairs into unified CSV and JSON catalogs.
"""
import os
import re
import csv
import json

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")

def extract_medicines_from_ts():
    ts_file = os.path.join(FRONTEND_DATA_DIR, "medicinesData.ts")
    if not os.path.exists(ts_file):
        print(f"Warning: {ts_file} not found.")
        return []

    with open(ts_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Match JSON-like object items
    # Extract name, genericName, category, therapeuticPurpose
    match = re.search(r'export const MEDICINES_DATABASE: Medicine\[\] = (\[.*\]);', content, re.DOTALL)
    if match:
        try:
            items = json.loads(match.group(1))
            return items
        except Exception as e:
            print("Failed direct JSON parse, parsing via regex:", e)
    
    # Fallback regex parsing
    items = []
    pattern = re.compile(
        r'\{\s*"id":\s*"(?P<id>[^"]+)",\s*'
        r'"name":\s*"(?P<name>[^"]+)",\s*'
        r'"brandName":\s*"(?P<brandName>[^"]*)",\s*'
        r'"genericName":\s*"(?P<genericName>[^"]*)",\s*'
        r'("tallMan":\s*"(?P<tallMan>[^"]*)",\s*)?'
        r'"category":\s*"(?P<category>[^"]*)",\s*'
        r'"therapeuticPurpose":\s*"(?P<purpose>[^"]*)".*?\}',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        d = m.groupdict()
        items.append({
            "name": d.get("name"),
            "brandName": d.get("brandName") or d.get("name"),
            "genericName": d.get("genericName") or d.get("name"),
            "category": d.get("category", "Prescription Drug"),
            "therapeuticPurpose": d.get("purpose", "Therapeutic treatment")
        })
    return items

def extract_pairs_from_ts():
    ts_file = os.path.join(FRONTEND_DATA_DIR, "lasaPairsData.ts")
    if not os.path.exists(ts_file):
        return []
    with open(ts_file, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r'export const LASA_PAIRS: LASAPair\[\] = (\[.*\]);', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    return []

def main():
    print("Merging datasets...")
    drugs_csv = os.path.join(DATA_DIR, "drugs.csv")
    existing_drugs = {}
    
    if os.path.exists(drugs_csv):
        with open(drugs_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row["brand_name"].strip().lower()
                existing_drugs[key] = row

    print(f"Existing drugs count: {len(existing_drugs)}")

    ts_meds = extract_medicines_from_ts()
    print(f"Extracted {len(ts_meds)} medicines from medicinesData.ts")

    added_count = 0
    for med in ts_meds:
        name = med.get("name", "").strip()
        brand = med.get("brandName", name).strip()
        generic = med.get("genericName", name).strip()
        cat = med.get("category", "Prescription Medicine").strip()
        purpose = med.get("therapeuticPurpose", "Clinical indication").strip()

        key = name.lower()
        if key not in existing_drugs:
            existing_drugs[key] = {
                "brand_name": name,
                "generic_name": generic,
                "drug_class": cat,
                "therapeutic_use": purpose,
                "common_indications": purpose
            }
            added_count += 1

    print(f"Added {added_count} new drugs to unified catalog. Total: {len(existing_drugs)}")

    # Write merged drugs.csv
    fieldnames = ["brand_name", "generic_name", "drug_class", "therapeutic_use", "common_indications"]
    with open(drugs_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in sorted(existing_drugs.values(), key=lambda x: x["brand_name"].lower()):
            writer.writerow(row)

    # Merge LASA pairs
    pairs_csv = os.path.join(DATA_DIR, "lasa_pairs.csv")
    existing_pairs = set()
    rows = []
    if os.path.exists(pairs_csv):
        with open(pairs_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                d1 = r["drug1"].strip()
                d2 = r["drug2"].strip()
                risk = r["risk_level"].strip()
                pair_key = tuple(sorted([d1.lower(), d2.lower()]))
                existing_pairs.add(pair_key)
                rows.append({"drug1": d1, "drug2": d2, "risk_level": risk})

    ts_pairs = extract_pairs_from_ts()
    print(f"Extracted {len(ts_pairs)} pairs from lasaPairsData.ts")
    added_pairs = 0
    for p in ts_pairs:
        d1 = p.get("medA", "").strip()
        d2 = p.get("medB", "").strip()
        risk = p.get("riskLevel", "High").strip()
        if not d1 or not d2:
            continue
        pair_key = tuple(sorted([d1.lower(), d2.lower()]))
        if pair_key not in existing_pairs:
            existing_pairs.add(pair_key)
            rows.append({"drug1": d1, "drug2": d2, "risk_level": risk})
            added_pairs += 1

    print(f"Added {added_pairs} new pairs to unified pairs catalog. Total: {len(rows)}")

    with open(pairs_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["drug1", "drug2", "risk_level"])
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print("Datasets merged successfully!")

if __name__ == "__main__":
    main()
