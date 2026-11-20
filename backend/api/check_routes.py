import time
import os
import datetime
import numpy as np
from flask import Blueprint, request, jsonify

from backend.config import Config
from backend.services.nlp_service import find_similar_drugs, get_bert_embedding, combined_similarity, preprocess
from backend.services.ml_service import extract_features, load_model
from backend.services.drug_service import drug_service
from backend.services.bda_service import bda_service
from backend.services.audit_service import audit_service
from backend.services.poca_service import (
    orthographic_similarity,
    phonetic_similarity,
    semantic_similarity,
    calculate_poca_hybrid,
    classify_risk,
    generate_tall_man,
    get_clinical_advice
)
from backend.utils.validators import validate_drug_name

check_bp = Blueprint("check", __name__, url_prefix="/api")

# Load trained models safely
_ensemble_model = load_model(os.path.join(Config.MODEL_DIR, "ensemble.pkl"))
_rf_model = load_model(os.path.join(Config.MODEL_DIR, "random_forest.pkl"))
_scaler = load_model(os.path.join(Config.MODEL_DIR, "scaler.pkl"))
_kmeans_data = load_model(os.path.join(Config.MODEL_DIR, "kmeans.pkl"))


def _predict_ensemble_probability(drug_a: str, drug_b: str, default_score: float) -> float:
    """Computes soft voting probability using saved Ensemble/RandomForest model."""
    try:
        feats = extract_features(drug_a, drug_b).reshape(1, -1)
        if _scaler:
            try:
                feats = _scaler.transform(feats)
            except Exception:
                pass
        if _ensemble_model and hasattr(_ensemble_model, "predict_proba"):
            return float(_ensemble_model.predict_proba(feats)[0][1])
        elif _rf_model and hasattr(_rf_model, "predict_proba"):
            return float(_rf_model.predict_proba(feats)[0][1])
    except Exception:
        pass
    return float(np.clip(default_score, 0.0, 1.0))


def _predict_kmeans_cluster(drug_name: str, all_drugs: list) -> tuple[int, list]:
    """Assigns TF-IDF character n-gram KMeans cluster."""
    cluster_id = 0
    cluster_members = []
    if _kmeans_data and isinstance(_kmeans_data, dict):
        try:
            kmeans = _kmeans_data.get("kmeans")
            vectorizer = _kmeans_data.get("vectorizer")
            if kmeans and vectorizer:
                vec = vectorizer.transform([drug_name])
                cluster_id = int(kmeans.predict(vec)[0])
                all_vecs = vectorizer.transform(all_drugs)
                all_preds = kmeans.predict(all_vecs)
                cluster_members = [all_drugs[i] for i, cid in enumerate(all_preds) if cid == cluster_id][:8]
        except Exception:
            pass
    return cluster_id, cluster_members


# =========================================================================
# ENDPOINT 1: /api/analyze-medicine (Primary Medicine Check Screening)
# =========================================================================
@check_bp.route("/analyze-medicine", methods=["POST"])
def analyze_medicine():
    """
    Unified medicine analysis endpoint for clinical medicine verification.
    Executes Bloom Filter check -> 6-metric NLP similarity -> FDA POCA composite
    -> ML Ensemble scoring -> KMeans clustering -> Tall Man generation.
    """
    start_time = time.time()
    try:
        data = request.get_json() or {}
        name = data.get("medicine_name", "").strip()
        source = data.get("source", "Manual Search")

        if not name:
            return jsonify({"error": "Medicine name is required."}), 400

        # Bloom Filter Check
        bloom_hit = bda_service.bloom_filter.contains(name)

        # Candidate Search
        all_drugs = drug_service.find_all_drug_names()
        candidates = find_similar_drugs(name, all_drugs, threshold=0.35)

        # Query drug detail lookup
        query_details = drug_service.find_drug(name) or {
            "brand_name": name,
            "generic_name": name,
            "drug_class": "Prescription Therapeutic",
            "therapeutic_use": "Clinical indication",
            "common_indications": "Therapeutic care",
            "dosage_form": "Tablet",
            "strength": "Standard"
        }

        if not candidates:
            # Low Risk - No candidate matched
            proc_time = round((time.time() - start_time) * 1000, 2)
            bda_service.record_check_event(name, risk_level="Clear")

            return jsonify({
                "queryMedicine": {
                    "name": name,
                    "brandName": query_details.get("brand_name", name),
                    "genericName": query_details.get("generic_name", name),
                    "category": query_details.get("drug_class", "Prescription Therapeutic"),
                    "therapeuticPurpose": query_details.get("therapeutic_use", "Clinical indication"),
                    "dosageForm": query_details.get("dosage_form", "Tablet"),
                    "strength": query_details.get("strength", "Standard"),
                    "manufacturer": "Pharmacopoeia Database"
                },
                "confusedPartner": None,
                "spellingSimilarity": 0.0,
                "phoneticSimilarity": 0.0,
                "semanticSimilarity": 0.0,
                "overallRiskScore": 0.0,
                "riskLevel": "Clear",
                "hasRisk": False,
                "flagReasons": ["No confusable sound-alike or look-alike medication detected in formulary."],
                "clinicalAdvice": "Standard verification protocols apply. No significant collision detected.",
                "tallManQuery": name,
                "tallManPartner": None,
                "timestamp": datetime.datetime.now().strftime("%H:%M"),
                # Extended Multi-Engine Surveillance features
                "ensembleProbability": 0.02,
                "similarityBreakdown": {
                    "levenshtein": 0.0, "bisim": 0.0, "soundex": 0.0,
                    "dice": 0.0, "metaphone": 0.0, "bertCosine": 0.0
                },
                "clusterId": 0,
                "clusterMembers": [],
                "bloomHit": bloom_hit,
                "processingTimeMs": proc_time
            }), 200

        top_cand = candidates[0]
        partner_name = top_cand["brand_name"]

        partner_details = drug_service.find_drug(partner_name) or {
            "brand_name": partner_name,
            "generic_name": partner_name,
            "drug_class": "Prescription Therapeutic",
            "therapeutic_use": "Clinical indication",
            "common_indications": "Therapeutic care",
            "dosage_form": "Tablet",
            "strength": "Standard"
        }

        # Calculate POCA composite
        ortho = orthographic_similarity(name, partner_name)
        phon = phonetic_similarity(name, partner_name)
        sem = semantic_similarity(query_details.get("drug_class", ""), partner_details.get("drug_class", ""))
        poca_score = calculate_poca_hybrid(ortho, phon, sem)

        # ML Ensemble Probability
        prob = _predict_ensemble_probability(name, partner_name, default_score=top_cand["combined_score"])

        # Final unified risk classification
        risk_level = classify_risk(max(poca_score, prob * 100.0))
        tall_a, tall_b = generate_tall_man(name, partner_name)
        advice = get_clinical_advice(name, partner_name, risk_level, query_details.get("drug_class", ""), partner_details.get("drug_class", ""))

        cluster_id, cluster_members = _predict_kmeans_cluster(name, all_drugs)

        proc_time = round((time.time() - start_time) * 1000, 2)
        bda_service.record_check_event(name, risk_level=risk_level)

        flag_reasons = [
            f"Spelling (Orthographic) overlap of {ortho}%",
            f"Phonetic sound-alike similarity of {phon}%",
            f"Bio_ClinicalBERT semantic closeness of {round(top_cand.get('bert_cosine', 0.0) * 100, 1)}%",
            f"ML Soft-Voting Ensemble collision probability of {round(prob * 100, 1)}%"
        ]

        return jsonify({
            "queryMedicine": {
                "name": name,
                "brandName": query_details.get("brand_name", name),
                "genericName": query_details.get("generic_name", name),
                "category": query_details.get("drug_class", "Prescription Therapeutic"),
                "therapeuticPurpose": query_details.get("therapeutic_use", "Clinical indication"),
                "dosageForm": query_details.get("dosage_form", "Tablet"),
                "strength": query_details.get("strength", "Standard"),
                "manufacturer": "Pharmacopoeia Database"
            },
            "confusedPartner": {
                "name": partner_name,
                "brandName": partner_details.get("brand_name", partner_name),
                "genericName": partner_details.get("generic_name", partner_name),
                "category": partner_details.get("drug_class", "Prescription Therapeutic"),
                "therapeuticPurpose": partner_details.get("therapeutic_use", "Clinical indication"),
                "dosageForm": partner_details.get("dosage_form", "Tablet"),
                "strength": partner_details.get("strength", "Standard"),
                "manufacturer": "Pharmacopoeia Database"
            },
            "spellingSimilarity": ortho,
            "phoneticSimilarity": phon,
            "semanticSimilarity": sem,
            "overallRiskScore": poca_score,
            "riskLevel": risk_level,
            "hasRisk": poca_score >= 50.0 or prob >= 0.5,
            "flagReasons": flag_reasons,
            "clinicalAdvice": advice,
            "tallManQuery": tall_a,
            "tallManPartner": tall_b,
            "timestamp": datetime.datetime.now().strftime("%H:%M"),
            # Extended Multi-Engine Surveillance features
            "ensembleProbability": round(prob, 4),
            "similarityBreakdown": {
                "levenshtein": top_cand["levenshtein"],
                "bisim": top_cand["bisim"],
                "soundex": top_cand["soundex"],
                "dice": top_cand["dice"],
                "metaphone": top_cand["metaphone"],
                "bertCosine": top_cand["bert_cosine"]
            },
            "clusterId": cluster_id,
            "clusterMembers": cluster_members,
            "allSimilarCandidates": candidates[:5],
            "bloomHit": bloom_hit,
            "processingTimeMs": proc_time
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================================
# ENDPOINT 2: /api/compare (Dual Drug Side-by-Side Comparison)
# =========================================================================
@check_bp.route("/compare", methods=["GET", "POST"])
def compare_medicines():
    """Direct dual drug comparator returning full POCA + NLP + ML breakdown."""
    data = (request.get_json(silent=True) or {}) if request.is_json else {}
    med_a = (request.args.get("medA") or request.args.get("medicineA") or request.args.get("drug1") or data.get("medA") or data.get("medicineA") or data.get("drug1") or "").strip()
    med_b = (request.args.get("medB") or request.args.get("medicineB") or request.args.get("drug2") or data.get("medB") or data.get("medicineB") or data.get("drug2") or "").strip()

    if not med_a or not med_b:
        return jsonify({"error": "Both medA and medB parameters are required."}), 400

    det_a = drug_service.find_drug(med_a) or {"brand_name": med_a, "generic_name": med_a, "drug_class": "Prescription Drug", "therapeutic_use": "Clinical indication"}
    det_b = drug_service.find_drug(med_b) or {"brand_name": med_b, "generic_name": med_b, "drug_class": "Prescription Drug", "therapeutic_use": "Clinical indication"}

    ortho = orthographic_similarity(med_a, med_b)
    phon = phonetic_similarity(med_a, med_b)
    sem = semantic_similarity(det_a.get("drug_class", ""), det_b.get("drug_class", ""))
    poca_score = calculate_poca_hybrid(ortho, phon, sem)

    comb = combined_similarity(med_a, med_b)
    prob = _predict_ensemble_probability(med_a, med_b, default_score=comb)
    risk_level = classify_risk(max(poca_score, prob * 100.0))

    tall_a, tall_b = generate_tall_man(med_a, med_b)
    advice = get_clinical_advice(med_a, med_b, risk_level, det_a.get("drug_class", ""), det_b.get("drug_class", ""))

    return jsonify({
        "medA": med_a,
        "medB": med_b,
        "medADetails": det_a,
        "medBDetails": det_b,
        "tallA": tall_a,
        "tallB": tall_b,
        "spellingSimilarity": ortho,
        "phoneticSimilarity": phon,
        "semanticSimilarity": sem,
        "overallRiskScore": poca_score,
        "riskLevel": risk_level,
        "safetyMessage": advice,
        "ensembleProbability": round(prob, 4),
        "combinedScore": round(comb, 4)
    }), 200


# =========================================================================
# ENDPOINT 3: /api/scan-prescription (Prescription Scanner Backend Engine)
# =========================================================================
@check_bp.route("/scan-prescription", methods=["POST"])
def scan_prescription():
    """
    Multi-drug combinatorial prescription screening matrix.
    Scans pairwise list of medicines for Look-Alike Sound-Alike collisions.
    """
    data = request.get_json() or {}
    med_list = data.get("medicines", [])
    if not isinstance(med_list, list) or not med_list:
        return jsonify({"error": "List of medicines required."}), 400

    items = []
    high_risk_count = 0
    conflicts_count = 0

    all_drugs = drug_service.find_all_drug_names()

    for raw in med_list:
        clean = str(raw).strip()
        if not clean:
            continue
        cands = find_similar_drugs(clean, all_drugs, threshold=0.35)
        top = cands[0] if cands else None
        partner = top["brand_name"] if top else None
        score = round(top["combined_score"] * 100, 1) if top else 0.0
        risk = classify_risk(score)

        if risk in ["High", "Medium"]:
            conflicts_count += 1
            if risk == "High":
                high_risk_count += 1

        tall_q, tall_p = generate_tall_man(clean, partner) if partner else (clean, None)

        items.append({
            "name": clean,
            "potentialConflict": partner,
            "tallMan": tall_q,
            "tallManConflict": tall_p,
            "lasaScore": score,
            "riskLevel": risk
        })

    return jsonify({
        "totalDetected": len(items),
        "potentialConflicts": conflicts_count,
        "highRiskConflicts": high_risk_count,
        "medicines": items,
        "timestamp": datetime.datetime.now().strftime("%H:%M")
    }), 200


# =========================================================================
# ENDPOINT 3B: /api/parse-prescription-text (Prescription OCR Text NLP Parser)
# =========================================================================
@check_bp.route("/parse-prescription-text", methods=["POST"])
def parse_prescription_text():
    """
    Parses raw text extracted by OCR from a prescription image/document.
    Extracts medicine names and strengths, matching against the catalog.
    """
    import re
    data = request.get_json() or {}
    raw_text = data.get("text", "")
    if not raw_text or not raw_text.strip():
        return jsonify({"medicines": []}), 200

    all_drugs = drug_service.find_all_drug_names()
    drug_lower_map = {d.lower(): d for d in all_drugs}

    lines = [l.strip() for l in raw_text.splitlines() if len(l.strip()) > 1]
    extracted = []
    seen = set()

    noise_patterns = [
        re.compile(r"^(dr\.|doctor|m\.?b\.?b\.?s|m\.?d\.|clinic|hospital|patient|date|time|rx\b[:\s\-]*$)", re.I),
        re.compile(r"^[_\-=\*\~]{3,}$")
    ]

    for line in lines:
        if any(p.search(line) for p in noise_patterns):
            continue

        clean_line = re.sub(r"^(?:rx\b[:\s\-]*|\d+[\.\)\-:\s]+|[•\*\-\–\—\>]\s*)+", "", line, flags=re.I).strip()
        if len(clean_line) < 2:
            continue

        dosage_match = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|%)\b(?:\s*(?:duo|forte|sr|xr|cr|ds))?)", clean_line, re.I)
        dosage = dosage_match.group(0).strip() if dosage_match else ""

        words = re.findall(r"[A-Za-z\-]{3,30}", clean_line)
        matched_drug = None

        for w in words:
            wl = w.lower()
            if wl in drug_lower_map:
                matched_drug = drug_lower_map[wl]
                break

        if not matched_drug:
            for w in words:
                cands = find_similar_drugs(w, all_drugs, threshold=0.75)
                if cands:
                    matched_drug = cands[0]["brand_name"]
                    break

        if matched_drug and matched_drug.lower() not in seen:
            seen.add(matched_drug.lower())
            full_label = f"{matched_drug} {dosage}".strip()
            extracted.append(full_label)
        elif words and not matched_drug:
            candidate = words[0].capitalize()
            if len(candidate) >= 3 and candidate.lower() not in seen:
                seen.add(candidate.lower())
                full_label = f"{candidate} {dosage}".strip()
                extracted.append(full_label)

    return jsonify({
        "success": True,
        "medicines": extracted,
        "count": len(extracted)
    }), 200



# =========================================================================
# ENDPOINT 4: /api/check (Standard Ensemble Surveillance Endpoint)
# =========================================================================
@check_bp.route("/check", methods=["POST"])
def check_lasa_risk():
    """Main LASA Guard Check Endpoint (Multi-Engine Matrix Schema)."""
    start_time = time.time()
    try:
        data = request.get_json() or {}
        drug_name = (data.get("drug_name") or data.get("drug1") or data.get("medicine_name") or "").strip()
        user_id = data.get("user_id", "usr_anonymous")
        role = data.get("role", "Clinician")

        if not validate_drug_name(drug_name):
            return jsonify({
                "success": False,
                "data": None,
                "error": "Please provide a valid drug brand or generic name (2-100 characters)."
            }), 400

        bloom_hit = bda_service.bloom_filter.contains(drug_name)
        all_drugs = drug_service.find_all_drug_names()
        candidates = find_similar_drugs(drug_name, all_drugs, threshold=0.35)

        if not candidates:
            proc_time = round((time.time() - start_time) * 1000, 2)
            input_drug_details = drug_service.find_drug(drug_name)

            interaction_payload = {
                "drug_name": drug_name,
                "matched_drug": None,
                "similarity_score": 0.0,
                "risk_level": "Low",
                "user_id": user_id,
                "role": role,
                "processing_time_ms": proc_time
            }
            drug_service.log_interaction(interaction_payload)
            bda_service.record_check_event(drug_name, risk_level="Low")

            return jsonify({
                "success": True,
                "data": {
                    "input_drug": drug_name,
                    "input_details": input_drug_details,
                    "top_match": None,
                    "top_match_details": None,
                    "risk_level": "Low",
                    "similarity_score": 0.0,
                    "ensemble_probability": 0.05,
                    "similarity_breakdown": None,
                    "cluster_id": 0,
                    "cluster_members": [],
                    "bloom_hit": bloom_hit,
                    "processing_time_ms": proc_time
                },
                "error": None
            }), 200

        top_cand = candidates[0]
        top_match_name = top_cand["brand_name"]

        prob = _predict_ensemble_probability(drug_name, top_match_name, default_score=top_cand["combined_score"])
        risk_level = "High" if prob >= Config.RISK_THRESHOLD or top_cand["combined_score"] >= 0.7 else "Medium"
        if prob < 0.5 and top_cand["combined_score"] < 0.5:
            risk_level = "Low"

        cluster_id, cluster_members = _predict_kmeans_cluster(drug_name, all_drugs)

        input_drug_details = drug_service.find_drug(drug_name)
        top_match_details = drug_service.find_drug(top_match_name)
        proc_time = round((time.time() - start_time) * 1000, 2)

        interaction_payload = {
            "drug_name": drug_name,
            "matched_drug": top_match_name,
            "similarity_score": top_cand["combined_score"],
            "ensemble_probability": round(prob, 4),
            "risk_level": risk_level,
            "user_id": user_id,
            "role": role,
            "processing_time_ms": proc_time
        }
        drug_service.log_interaction(interaction_payload)
        bda_service.record_check_event(drug_name, risk_level=risk_level)

        return jsonify({
            "success": True,
            "data": {
                "input_drug": drug_name,
                "input_details": input_drug_details,
                "top_match": top_match_name,
                "top_match_details": top_match_details,
                "risk_level": risk_level,
                "similarity_score": top_cand["combined_score"],
                "ensemble_probability": round(prob, 4),
                "similarity_breakdown": {
                    "levenshtein": top_cand["levenshtein"],
                    "bisim": top_cand["bisim"],
                    "soundex": top_cand["soundex"],
                    "dice": top_cand["dice"],
                    "metaphone": top_cand["metaphone"],
                    "bert_cosine": top_cand["bert_cosine"]
                },
                "cluster_id": cluster_id,
                "cluster_members": cluster_members,
                "all_similar_candidates": candidates[:5],
                "bloom_hit": bloom_hit,
                "processing_time_ms": proc_time
            },
            "error": None
        }), 200

    except Exception as e:
        return jsonify({"success": False, "data": None, "error": f"Error processing LASA check: {str(e)}"}), 500


# =========================================================================
# ENDPOINT 5: /api/override (FDA-Grade Clinician Override Logger)
# =========================================================================
@check_bp.route("/override", methods=["POST"])
def log_risk_override():
    """Log clinician override of a High/Medium risk LASA warning."""
    try:
        data = request.get_json() or {}
        drug1 = data.get("drug1", "")
        drug2 = data.get("drug2", "")
        reason = data.get("reason", "")
        clinician_name = data.get("clinician_name", "Dr. Clinician")
        clinician_license = data.get("clinician_license", "MD-EX-99812")
        user_id = data.get("user_id", "usr_clinician_01")

        if not drug1 or not drug2 or not reason:
            return jsonify({
                "success": False,
                "data": None,
                "error": "drug1, drug2, and justification reason are required fields."
            }), 400

        override_record = {
            "drug1": drug1,
            "drug2": drug2,
            "reason": reason,
            "clinician_name": clinician_name,
            "clinician_license": clinician_license,
            "user_id": user_id
        }

        logged = drug_service.log_override(override_record)
        return jsonify({
            "success": True,
            "data": logged,
            "error": None
        }), 201

    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500
