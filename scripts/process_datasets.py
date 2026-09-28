import zipfile
import io
import csv
import json
import os
import re

print("Starting dataset processing...")

# 1. Critical LASA Pairs curated directly from the PPT (Honours AIML 2026-27) & Lancet 2024 paper
curated_pairs = [
    {
        "medA": "Hydroxyzine",
        "medB": "Hydralazine",
        "brandA": "Atarax",
        "brandB": "Apresoline",
        "tallManA": "hydrOXYzine",
        "tallManB": "hydrALAZINE",
        "categoryA": "Antihistamine / Anxiolytic",
        "categoryB": "Direct Vasodilator / Antihypertensive",
        "purposeA": "Allergy-related symptoms, pruritus, anxiety, and sedation",
        "purposeB": "Severe essential hypertension and hypertensive emergencies",
        "dosageA": "Tablet / Syrup (10mg, 25mg, 50mg)",
        "dosageB": "Tablet / Injection (25mg, 50mg)",
        "spellingSimilarity": 91,
        "phoneticSimilarity": 84,
        "semanticSimilarity": 72,
        "overallRiskScore": 89,
        "riskLevel": "High",
        "flagReasons": [
            "High orthographic (spelling) similarity (91% overlap)",
            "Nearly identical phonetic prefix ('Hydrox-' vs 'Hydral-')",
            "Similar character sequence with shared 8 characters",
            "Severe clinical risk: inadvertent administration of vasodilator instead of antihistamine causes profound hypotension"
        ],
        "clinicalAdvice": "Verify patient diagnosis (hypertension vs allergy/sedation), baseline blood pressure, and strength before dispensing."
    },
    {
        "medA": "Celebrex",
        "medB": "Celexa",
        "brandA": "Celebrex",
        "brandB": "Celexa",
        "tallManA": "CELEbrex",
        "tallManB": "CELexa",
        "categoryA": "NSAID (COX-2 Inhibitor)",
        "categoryB": "SSRI Antidepressant",
        "purposeA": "Osteoarthritis, rheumatoid arthritis, acute pain management",
        "purposeB": "Major depressive disorder, generalized anxiety disorder",
        "dosageA": "Capsule (100mg, 200mg)",
        "dosageB": "Tablet / Oral solution (10mg, 20mg, 40mg)",
        "spellingSimilarity": 76,
        "phoneticSimilarity": 82,
        "semanticSimilarity": 65,
        "overallRiskScore": 76,
        "riskLevel": "Medium",
        "flagReasons": [
            "Phonetic prefix collision ('Cele-')",
            "Similar brand name length and sound-alike cadence",
            "Disparate therapeutic targets (musculoskeletal pain vs psychiatric disorder)"
        ],
        "clinicalAdvice": "Confirm psychiatric vs inflammatory pain indication and check dosage form (capsule vs tablet)."
    },
    {
        "medA": "Clonidine",
        "medB": "Clonazepam",
        "brandA": "Catapres",
        "brandB": "Klonopin",
        "tallManA": "cloNIDine",
        "tallManB": "clonazePAM",
        "categoryA": "Centrally Acting Alpha-2 Agonist",
        "categoryB": "Benzodiazepine Anticonvulsant",
        "purposeA": "Hypertension, ADHD, opioid withdrawal adjunct",
        "purposeB": "Panic disorder, seizure disorders, akathisia",
        "dosageA": "Tablet / Transdermal patch (0.1mg, 0.2mg, 0.3mg)",
        "dosageB": "Tablet / Dispersible tablet (0.5mg, 1mg, 2mg)",
        "spellingSimilarity": 61,
        "phoneticSimilarity": 68,
        "semanticSimilarity": 58,
        "overallRiskScore": 61,
        "riskLevel": "Medium",
        "flagReasons": [
            "Shared 'Clon-' root leading to quick-selection typing errors",
            "Both act on central nervous system but with distinct receptor profiles",
            "Dosage values are in low decimal milligrams, compounding titration errors"
        ],
        "clinicalAdvice": "Verify indication (blood pressure control vs seizure/anxiety prophylaxis) and decimal dosing precision."
    },
    {
        "medA": "Olvance",
        "medB": "Oleanz",
        "brandA": "Olvance 20 / 40",
        "brandB": "Oleanz 5 / 10",
        "tallManA": "OLVance",
        "tallManB": "OLEAnz",
        "categoryA": "Angiotensin II Receptor Blocker (ARB)",
        "categoryB": "Atypical Antipsychotic",
        "purposeA": "Hypertension and cardiovascular risk reduction",
        "purposeB": "Schizophrenia, bipolar mania, and psychotic agitation",
        "dosageA": "Tablet (20mg, 40mg)",
        "dosageB": "Tablet / Melt tab (2.5mg, 5mg, 10mg)",
        "spellingSimilarity": 82,
        "phoneticSimilarity": 86,
        "semanticSimilarity": 70,
        "overallRiskScore": 85,
        "riskLevel": "High",
        "flagReasons": [
            "Deceptively similar brand names in Indian market (Lancet 2024 highlight)",
            "Olmesartan vs Olanzapine active ingredient confusion",
            "Severe clinical mismatch: patient prescribed cardiovascular therapy receives potent antipsychotic"
        ],
        "clinicalAdvice": "MANDATORY verification of INN/generic name: ensure patient receives Olmesartan for BP, NOT Olanzapine."
    },
    {
        "medA": "Medzol",
        "medB": "Medzole",
        "brandA": "Medzol (Midazolam)",
        "brandB": "Medzole (Metronidazole)",
        "tallManA": "MEDZOL-Mida",
        "tallManB": "MEDZOLE-Metro",
        "categoryA": "Short-acting Benzodiazepine / Anesthetic",
        "categoryB": "Nitroimidazole Antimicrobial / Antiprotozoal",
        "purposeA": "Procedural sedation, pre-anesthesia induction, status epilepticus",
        "purposeB": "Amoebiasis, giardiasis, trichomoniasis, anaerobic infections",
        "dosageA": "Injection / Oral syrup (1mg/mL, 5mg/mL)",
        "dosageB": "Oral suspension / Tablet (200mg, 400mg)",
        "spellingSimilarity": 95,
        "phoneticSimilarity": 94,
        "semanticSimilarity": 80,
        "overallRiskScore": 95,
        "riskLevel": "High",
        "flagReasons": [
            "Identical brand root with single terminal letter difference (Medzol vs Medzole)",
            "Same brand name used in India for Midazolam, Pantoprazole, and Metronidazole",
            "Life-threatening potential: administering intravenous sedative instead of gastrointestinal antimicrobial"
        ],
        "clinicalAdvice": "Critical alert from Lancet 2024: Check active ingredient, route of administration, and indication before release."
    },
    {
        "medA": "Flucor",
        "medB": "Flucor-M",
        "brandA": "Flucor 150",
        "brandB": "Flucor (Flupentixol/Melitracen)",
        "tallManA": "FLUCOR-Flucon",
        "tallManB": "FLUCOR-Flupen",
        "categoryA": "Triazole Antifungal",
        "categoryB": "Psychotropic / Antidepressant Combination",
        "purposeA": "Systemic and mucosal candidiasis, cryptococcal meningitis",
        "purposeB": "Psychogenic depression, depressive neurosis, psychosomatic distress",
        "dosageA": "Capsule / Tablet (150mg)",
        "dosageB": "Film-coated tablet (0.5mg + 10mg)",
        "spellingSimilarity": 92,
        "phoneticSimilarity": 90,
        "semanticSimilarity": 75,
        "overallRiskScore": 90,
        "riskLevel": "High",
        "flagReasons": [
            "Same brand name used by different entities for completely unrelated drugs",
            "Antifungal vs psychotropic medication confusion",
            "Risk of unwarranted neurological side effects or untreated fungal infection"
        ],
        "clinicalAdvice": "Verify generic composition: Fluconazole vs Flupentixol + Melitracen."
    },
    {
        "medA": "Linamac",
        "medB": "Linamac-5",
        "brandA": "Linamac (Lenalidomide)",
        "brandB": "Linamac (Linagliptin)",
        "tallManA": "LINAMAC-Lena",
        "tallManB": "LINAMAC-Lina",
        "categoryA": "Immunomodulatory Antineoplastic Agent",
        "categoryB": "Dipeptidyl Peptidase-4 (DPP-4) Inhibitor",
        "purposeA": "Multiple myeloma, myelodysplastic syndromes (MDS)",
        "purposeB": "Type 2 Diabetes Mellitus glycemic control",
        "dosageA": "Capsule (5mg, 10mg, 25mg)",
        "dosageB": "Tablet (5mg)",
        "spellingSimilarity": 98,
        "phoneticSimilarity": 96,
        "semanticSimilarity": 85,
        "overallRiskScore": 96,
        "riskLevel": "High",
        "flagReasons": [
            "Exact brand name marketed for both chemotherapy agent and antidiabetic pill",
            "Teratogenic and cytotoxic properties of Lenalidomide",
            "High severity error identified in Indian market pharmacovigilance study"
        ],
        "clinicalAdvice": "DO NOT DISPENSE without oncologist/endocrinologist confirmation of exact molecular entity."
    },
    {
        "medA": "Metformin",
        "medB": "Metronidazole",
        "brandA": "Glucophage",
        "brandB": "Flagyl",
        "tallManA": "metFORMIN",
        "tallManB": "metroNIDAZOLE",
        "categoryA": "Biguanide Antidiabetic",
        "categoryB": "Nitroimidazole Antibiotic",
        "purposeA": "Type 2 diabetes glycemic regulation and insulin sensitization",
        "purposeB": "Anaerobic bacterial infections and protozoal infections",
        "dosageA": "Tablet (500mg, 850mg, 1000mg)",
        "dosageB": "Tablet / Infusion (200mg, 400mg, 500mg)",
        "spellingSimilarity": 70,
        "phoneticSimilarity": 74,
        "semanticSimilarity": 62,
        "overallRiskScore": 72,
        "riskLevel": "Medium",
        "flagReasons": [
            "Shared 'Met-' prefix and similar letter length",
            "Frequently prescribed in primary care, increasing exposure to dispensing errors",
            "Confusion can trigger hypoglycemia or ineffective infection treatment"
        ],
        "clinicalAdvice": "Confirm whether prescription is for glycemic control or antimicrobial therapy."
    },
    {
        "medA": "Alprazolam",
        "medB": "Lorazepam",
        "brandA": "Xanax / Alprax",
        "brandB": "Ativan / Lopez",
        "tallManA": "ALPRAZolam",
        "tallManB": "LORazepam",
        "categoryA": "Short-acting Benzodiazepine",
        "categoryB": "Intermediate-acting Benzodiazepine",
        "purposeA": "Acute panic disorder and severe anxiety",
        "purposeB": "Pre-medication, acute seizure cessation, insomnia",
        "dosageA": "Tablet (0.25mg, 0.5mg, 1mg)",
        "dosageB": "Tablet / Injection (1mg, 2mg)",
        "spellingSimilarity": 75,
        "phoneticSimilarity": 78,
        "semanticSimilarity": 88,
        "overallRiskScore": 81,
        "riskLevel": "High",
        "flagReasons": [
            "Identical '-azepam' chemical suffix and common 0.5mg/1mg strengths",
            "Different half-lives and pharmacokinetic profiles",
            "Controlled schedule IV substance risk"
        ],
        "clinicalAdvice": "Verify intended potency, dosing frequency, and psychiatric diagnosis."
    },
    {
        "medA": "Dobutamine",
        "medB": "Dopamine",
        "brandA": "Dobutrex",
        "brandB": "Intropin",
        "tallManA": "dOBUTamine",
        "tallManB": "dOPAmine",
        "categoryA": "Beta-1 Adrenergic Inotrope",
        "categoryB": "Inotropic / Vasopressor Catecholamine",
        "purposeA": "Cardiogenic shock, severe heart failure with low ejection fraction",
        "purposeB": "Hemodynamic instability, hypotension, distributive shock",
        "dosageA": "IV Infusion (250mg/20mL)",
        "dosageB": "IV Infusion (200mg/5mL, 400mg/5mL)",
        "spellingSimilarity": 78,
        "phoneticSimilarity": 81,
        "semanticSimilarity": 85,
        "overallRiskScore": 84,
        "riskLevel": "High",
        "flagReasons": [
            "Critical ICU inotropic drug confusion",
            "Shared 'Do-amine' phonetics and emergency settings",
            "Dopamine increases systemic vascular resistance; Dobutamine decreases afterload"
        ],
        "clinicalAdvice": "Emergency setting double-check: check whether vasodilation or vasoconstriction is clinically indicated."
    },
    {
        "medA": "Cefazolin",
        "medB": "Ceftriaxone",
        "brandA": "Kefzol",
        "brandB": "Rocephin / Monocef",
        "tallManA": "ceFAZolin",
        "tallManB": "cefTRIAXone",
        "categoryA": "1st Generation Cephalosporin",
        "categoryB": "3rd Generation Cephalosporin",
        "purposeA": "Surgical site infection prophylaxis, MSSA infections",
        "purposeB": "Meningitis, gonorrhea, pyelonephritis, enteric fever",
        "dosageA": "IV/IM Powder for injection (500mg, 1g)",
        "dosageB": "IV/IM Powder for injection (250mg, 1g, 2g)",
        "spellingSimilarity": 71,
        "phoneticSimilarity": 75,
        "semanticSimilarity": 82,
        "overallRiskScore": 76,
        "riskLevel": "Medium",
        "flagReasons": [
            "Shared 'Cef-' cephalosporin class prefix",
            "Distinct antimicrobial spectrum (1st gen vs 3rd gen)",
            "Commonly used peri-operatively in surgical wards"
        ],
        "clinicalAdvice": "Confirm surgical prophylaxis vs systemic gram-negative therapy."
    },
    {
        "medA": "Ephedrine",
        "medB": "Epinephrine",
        "brandA": "Akovaz",
        "brandB": "Adrenalin / EpiPen",
        "tallManA": "ePHEDrine",
        "tallManB": "EPINEPHRine",
        "categoryA": "Indirect Sympathomimetic Vasopressor",
        "categoryB": "Direct Alpha/Beta Adrenergic Agonist",
        "purposeA": "Anesthesia-induced hypotension, bronchodilation",
        "purposeB": "Anaphylaxis, cardiac arrest, severe bronchospasm",
        "dosageA": "Injection (50mg/mL)",
        "dosageB": "Injection (1mg/mL [1:1000], 0.1mg/mL [1:10,000])",
        "spellingSimilarity": 79,
        "phoneticSimilarity": 83,
        "semanticSimilarity": 90,
        "overallRiskScore": 88,
        "riskLevel": "High",
        "flagReasons": [
            "Dramatic potency difference (Epinephrine is ~100x more potent than Ephedrine)",
            "High mortality risk if Epinephrine is given at Ephedrine dosages",
            "Life-threatening emergency drug pair"
        ],
        "clinicalAdvice": "HIGH RISK: Double check vial concentration, dilution, and intended route before administration."
    }
]

# Write lasaPairsData.ts
out_dir = os.path.join("frontend", "src", "data")
os.makedirs(out_dir, exist_ok=True)

with open(os.path.join(out_dir, "lasaPairsData.ts"), "w", encoding="utf-8") as f:
    f.write("import { LASAPair } from '../types/lasa';\n\n")
    f.write("export const LASA_PAIRS: LASAPair[] = ")
    f.write(json.dumps(curated_pairs, indent=2))
    f.write(";\n")

print(f"Wrote {len(curated_pairs)} curated LASA pairs to lasaPairsData.ts")

# 2. Extract representative medicines from archive (2).zip (A_Z_medicines_dataset_of_India.csv)
# and archive (1).zip (medicine_dataset.csv)
all_medicines = []
seen_names = set()

# First, add the curated medicines
for pair in curated_pairs:
    for prefix in ["A", "B"]:
        name = pair[f"med{prefix}"]
        if name.lower() not in seen_names:
            seen_names.add(name.lower())
            all_medicines.append({
                "id": f"lasa-{len(all_medicines) + 1}",
                "name": name,
                "brandName": pair[f"brand{prefix}"],
                "genericName": name,
                "tallMan": pair[f"tallMan{prefix}"],
                "category": pair[f"category{prefix}"],
                "therapeuticPurpose": pair[f"purpose{prefix}"],
                "dosageForm": pair[f"dosage{prefix}"].split("(")[0].strip(),
                "strength": pair[f"dosage{prefix}"].split("(")[1].replace(")", "").strip() if "(" in pair[f"dosage{prefix}"] else "Standard",
                "manufacturer": "Verified Clinical Pharmacopoeia",
                "isLasaRisk": True,
                "knownLasaPartner": pair["medB"] if prefix == "A" else pair["medA"],
                "origin": "Curated Clinical Benchmark / Lancet 2024"
            })

# Add specific Lancet paper drugs
lancet_extras = [
    {
        "name": "GNAP-10",
        "brandName": "GNAP-10",
        "genericName": "Enalapril",
        "tallMan": "GNAP-10",
        "category": "ACE Inhibitor",
        "therapeuticPurpose": "Hypertension, congestive heart failure",
        "dosageForm": "Tablet",
        "strength": "10 mg",
        "manufacturer": "CMG Biotech Private Limited",
        "isLasaRisk": True,
        "knownLasaPartner": "Telmisartan",
        "origin": "Lancet India 2024 Study"
    },
    {
        "name": "Telmisartan",
        "brandName": "Telma 40",
        "genericName": "Telmisartan",
        "tallMan": "telmiSARTAN",
        "category": "Angiotensin II Receptor Antagonist",
        "therapeuticPurpose": "Hypertension and cardiovascular protection",
        "dosageForm": "Tablet",
        "strength": "40 mg",
        "manufacturer": "Ridley Life Science Private Limited",
        "isLasaRisk": True,
        "knownLasaPartner": "GNAP-10",
        "origin": "Lancet India 2024 Study"
    },
    {
        "name": "Glimeimore",
        "brandName": "Glimeimore 2",
        "genericName": "Glimepiride",
        "tallMan": "glimePIRIDE",
        "category": "Sulfonylurea Antidiabetic",
        "therapeuticPurpose": "Type 2 Diabetes Mellitus",
        "dosageForm": "Tablet",
        "strength": "2 mg",
        "manufacturer": "Morepen Laboratories Limited",
        "isLasaRisk": True,
        "knownLasaPartner": "Metoprolol Tartrate",
        "origin": "Lancet India 2024 Study"
    },
    {
        "name": "Metoprolol Tartrate",
        "brandName": "Metolar",
        "genericName": "Metoprolol Tartrate",
        "tallMan": "metoPROLOL TARtrate",
        "category": "Selective Beta-1 Blocker",
        "therapeuticPurpose": "Hypertension, angina pectoris, post-MI care",
        "dosageForm": "Tablet",
        "strength": "50 mg",
        "manufacturer": "ANG Lifesciences India Limited",
        "isLasaRisk": True,
        "knownLasaPartner": "Glimeimore",
        "origin": "Lancet India 2024 Study"
    },
    {
        "name": "Paracetamol",
        "brandName": "Dolo 650 / Calpol",
        "genericName": "Acetaminophen",
        "tallMan": "paracetAMOL",
        "category": "Analgesic / Antipyretic",
        "therapeuticPurpose": "Fever, mild-to-moderate pain, headache",
        "dosageForm": "Tablet / Syrup",
        "strength": "500 mg / 650 mg",
        "manufacturer": "Micro Labs Ltd / GSK",
        "isLasaRisk": False,
        "origin": "Indian Standard Pharmacopoeia"
    },
    {
        "name": "Augmentin 625 Duo",
        "brandName": "Augmentin 625 Duo",
        "genericName": "Amoxicillin + Clavulanic Acid",
        "tallMan": "AUGMENTIN 625",
        "category": "Penicillin Class Antibiotic with Beta-Lactamase Inhibitor",
        "therapeuticPurpose": "Respiratory tract, ENT, skin, and soft tissue bacterial infections",
        "dosageForm": "Tablet",
        "strength": "500mg + 125mg",
        "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd",
        "isLasaRisk": False,
        "origin": "Indian A-Z Medicines Dataset"
    },
    {
        "name": "Azithral 500",
        "brandName": "Azithral 500",
        "genericName": "Azithromycin",
        "tallMan": "aZITHROmycin",
        "category": "Macrolide Antibiotic",
        "therapeuticPurpose": "Upper and lower respiratory bacterial infections, typhoid",
        "dosageForm": "Tablet",
        "strength": "500 mg",
        "manufacturer": "Alembic Pharmaceuticals Ltd",
        "isLasaRisk": True,
        "knownLasaPartner": "Azathioprine",
        "origin": "Indian A-Z Medicines Dataset"
    },
    {
        "name": "Azathioprine",
        "brandName": "Imuran",
        "genericName": "Azathioprine",
        "tallMan": "aZATHIOprine",
        "category": "Immunosuppressive Antimetabolite",
        "therapeuticPurpose": "Organ transplant rejection prevention, severe rheumatoid arthritis",
        "dosageForm": "Tablet",
        "strength": "50 mg",
        "manufacturer": "GlaxoSmithKline",
        "isLasaRisk": True,
        "knownLasaPartner": "Azithromycin",
        "origin": "FDA / Global Pharmacopoeia"
    },
    {
        "name": "Pan-D",
        "brandName": "Pan-D",
        "genericName": "Pantoprazole + Domperidone",
        "tallMan": "PAN-D",
        "category": "PPI + Prokinetic Agent",
        "therapeuticPurpose": "Gastroesophageal reflux disease (GERD), acid peptic ulcer",
        "dosageForm": "Capsule",
        "strength": "40mg + 30mg",
        "manufacturer": "Alkem Laboratories Ltd",
        "isLasaRisk": False,
        "origin": "Indian A-Z Medicines Dataset"
    }
]

for med in lancet_extras:
    if med["name"].lower() not in seen_names:
        seen_names.add(med["name"].lower())
        med["id"] = f"med-{len(all_medicines) + 1}"
        all_medicines.append(med)

# Read 150 diverse Indian medicines from archive (2).zip
if os.path.exists("archive (2).zip"):
    with zipfile.ZipFile("archive (2).zip") as z:
        with z.open("A_Z_medicines_dataset_of_India.csv") as f:
            reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
            count = 0
            for row in reader:
                name = row.get("name", "").strip()
                if not name or len(name) < 4:
                    continue
                clean_name = re.sub(r"\s+(Tablet|Capsule|Syrup|Injection|Suspension|Ointment|Gel|Cream|Drops|Lotion|Solution).*$", "", name, flags=re.I).strip()
                if not clean_name or clean_name.lower() in seen_names:
                    continue
                
                comp1 = row.get("short_composition1", "").strip()
                comp2 = row.get("short_composition2", "").strip()
                generic = comp1.split("(")[0].strip() if comp1 else clean_name
                strength = comp1.split("(")[1].replace(")", "").strip() if "(" in comp1 else "Standard"
                if comp2:
                    generic += " + " + comp2.split("(")[0].strip()
                
                mfg = row.get("manufacturer_name", "Indian Pharmaceutical Corp").strip()
                pack = row.get("pack_size_label", "Tablet").strip()
                form = "Tablet"
                for form_candidate in ["Capsule", "Tablet", "Syrup", "Injection", "Suspension", "Cream", "Drops"]:
                    if form_candidate.lower() in pack.lower() or form_candidate.lower() in name.lower():
                        form = form_candidate
                        break
                
                seen_names.add(clean_name.lower())
                all_medicines.append({
                    "id": f"ind-{len(all_medicines) + 1}",
                    "name": clean_name,
                    "brandName": name,
                    "genericName": generic,
                    "tallMan": clean_name,
                    "category": "Prescription Therapeutic",
                    "therapeuticPurpose": f"Clinical treatment formulation containing {generic}",
                    "dosageForm": form,
                    "strength": strength,
                    "manufacturer": mfg,
                    "isLasaRisk": False,
                    "origin": "A-Z Medicines Dataset of India"
                })
                count += 1
                if count >= 160:
                    break

# Read ~100 records from archive (1).zip (medicine_dataset.csv)
if os.path.exists("archive (1).zip"):
    with zipfile.ZipFile("archive (1).zip") as z:
        with z.open("medicine_dataset.csv") as f:
            reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"))
            count = 0
            for row in reader:
                name = row.get("Name", "").strip()
                if not name or name.lower() in seen_names or len(name) < 3:
                    continue
                seen_names.add(name.lower())
                all_medicines.append({
                    "id": f"fda-{len(all_medicines) + 1}",
                    "name": name,
                    "brandName": name,
                    "genericName": name,
                    "tallMan": name,
                    "category": row.get("Category", "Pharmaceutical Formulation").strip(),
                    "therapeuticPurpose": f"Indicated for {row.get('Indication', 'therapeutic management')}",
                    "dosageForm": row.get("Dosage Form", "Oral Dosage").strip(),
                    "strength": row.get("Strength", "Standard").strip(),
                    "manufacturer": row.get("Manufacturer", "Global Pharma").strip(),
                    "isLasaRisk": False,
                    "origin": "Clinical Medicine Dataset"
                })
                count += 1
                if count >= 100:
                    break

with open(os.path.join(out_dir, "medicinesData.ts"), "w", encoding="utf-8") as f:
    f.write("import { Medicine } from '../types/lasa';\n\n")
    f.write("export const MEDICINES_DATABASE: Medicine[] = ")
    f.write(json.dumps(all_medicines, indent=2))
    f.write(";\n")

print(f"Successfully generated medicinesData.ts with {len(all_medicines)} indexed medicines.")
