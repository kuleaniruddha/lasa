import os
import re
import pandas as pd
import numpy as np
from typing import List, Dict, Set, Any

# Load LASA registered pairs lookup
_lasa_pairs_registry = {}
_lasa_csv = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "lasa_pairs.csv"))
if os.path.exists(_lasa_csv):
    try:
        _df_lasa = pd.read_csv(_lasa_csv)
        for _, _row in _df_lasa.iterrows():
            d1 = str(_row["drug1"]).strip().lower()
            d2 = str(_row["drug2"]).strip().lower()
            risk = str(_row["risk_level"]).strip()
            _lasa_pairs_registry[(d1, d2)] = risk
            _lasa_pairs_registry[(d2, d1)] = risk
    except Exception:
        pass

# Dynamic imports with graceful fallbacks
try:
    import jellyfish
except ImportError:
    jellyfish = None

try:
    import nltk
    from nltk.stem import PorterStemmer
    _porter = PorterStemmer()
except Exception:
    nltk = None
    _porter = None

try:
    import spacy
    _nlp_spacy = spacy.load("en_core_web_sm")
except Exception:
    _nlp_spacy = None

try:
    from sentence_transformers import SentenceTransformer
    _bert_model = SentenceTransformer("emilyalsentzer/Bio_ClinicalBERT")
except Exception:
    _bert_model = None


def preprocess(name: str) -> str:
    """
    Lowercase, strip, and remove non-alphanumeric characters (except spaces).
    """
    if not name:
        return ""
    cleaned = name.lower().strip()
    return re.sub(r'[^a-z0-9\s]', '', cleaned)


def tokenize(name: str) -> List[str]:
    """
    Tokenize string using spaCy, fallback NLTK word_tokenize, fallback .split().
    """
    clean_name = preprocess(name)
    if _nlp_spacy:
        try:
            doc = _nlp_spacy(clean_name)
            return [token.text for token in doc if token.text.strip()]
        except Exception:
            pass
    if nltk:
        try:
            return nltk.word_tokenize(clean_name)
        except Exception:
            pass
    return [w for w in clean_name.split() if w]


def stem(name: str) -> str:
    """
    Stem word using NLTK PorterStemmer, fallback basic suffix stemmer.
    """
    clean_name = preprocess(name)
    if _porter:
        try:
            return _porter.stem(clean_name)
        except Exception:
            pass
    for suffix in ["ing", "ly", "ed", "ous", "ive", "able", "ible", "al", "ic", "is", "ex", "in"]:
        if clean_name.endswith(suffix) and len(clean_name) > len(suffix) + 2:
            return clean_name[:-len(suffix)]
    return clean_name


def get_bigrams(name: str) -> Set[str]:
    """
    Extract character bigrams set from clean string.
    """
    clean = preprocess(name).replace(" ", "")
    if len(clean) < 2:
        return {clean} if clean else set()
    return {clean[i:i+2] for i in range(len(clean) - 1)}


def get_bert_embedding(name: str) -> np.ndarray:
    """
    Get BERT embedding using SentenceTransformer (Bio_ClinicalBERT).
    Fallback to character ascii pseudo-embedding if model download fails.
    """
    clean_name = preprocess(name)
    if _bert_model:
        try:
            emb = _bert_model.encode(clean_name, convert_to_numpy=True)
            return emb
        except Exception:
            pass
    vec = np.zeros(128, dtype=np.float32)
    for i, char in enumerate(clean_name[:128]):
        vec[ord(char) % 128] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def levenshtein_similarity(a: str, b: str) -> float:
    """
    Calculate normalized Levenshtein similarity between 0.0 and 1.0.
    """
    s1, s2 = preprocess(a), preprocess(b)
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0

    if jellyfish and hasattr(jellyfish, 'levenshtein_distance'):
        dist = jellyfish.levenshtein_distance(s1, s2)
    else:
        if len(s1) < len(s2):
            s1, s2 = s2, s1
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        dist = previous_row[-1]

    max_len = max(len(s1), len(s2))
    return 1.0 - (dist / max_len)


def bisim_similarity(a: str, b: str) -> float:
    """
    Calculate BiSim (Jaccard similarity on character bigrams).
    """
    bg1 = get_bigrams(a)
    bg2 = get_bigrams(b)
    if not bg1 and not bg2:
        return 1.0
    if not bg1 or not bg2:
        return 0.0
    intersection = len(bg1.intersection(bg2))
    union = len(bg1.union(bg2))
    return intersection / union if union > 0 else 0.0


def soundex_similarity(a: str, b: str) -> float:
    """
    Calculate Soundex similarity (1.0 if identical code, 0.0 otherwise).
    """
    s1, s2 = preprocess(a), preprocess(b)
    if jellyfish:
        try:
            return 1.0 if jellyfish.soundex(s1) == jellyfish.soundex(s2) else 0.0
        except Exception:
            pass
    def _soundex_code(name):
        if not name:
            return ""
        name = name.upper()
        first = name[0]
        mapping = {'B':1,'F':1,'P':1,'V':1,'C':2,'G':2,'J':2,'K':2,'Q':2,'S':2,'X':2,'Z':2,
                   'D':3,'T':3,'L':4,'M':5,'N':5,'R':6}
        code = [first]
        for char in name[1:]:
            digit = str(mapping.get(char, ''))
            if digit and (not code or digit != code[-1]):
                code.append(digit)
        return (repr(''.join(code))[1:-1] + '0000')[:4]
    return 1.0 if _soundex_code(s1) == _soundex_code(s2) else 0.0


def metaphone_similarity(a: str, b: str) -> float:
    """
    Calculate Metaphone phonetic similarity.
    """
    s1, s2 = preprocess(a), preprocess(b)
    if jellyfish:
        try:
            m1 = jellyfish.metaphone(s1)
            m2 = jellyfish.metaphone(s2)
            if m1 == m2:
                return 1.0
            return levenshtein_similarity(m1, m2)
        except Exception:
            pass
    return soundex_similarity(a, b)


def dice_similarity(a: str, b: str) -> float:
    """
    Calculate Sorensen-Dice coefficient on character bigrams.
    """
    bg1 = get_bigrams(a)
    bg2 = get_bigrams(b)
    if not bg1 and not bg2:
        return 1.0
    if not bg1 or not bg2:
        return 0.0
    intersection = len(bg1.intersection(bg2))
    total = len(bg1) + len(bg2)
    return (2.0 * intersection) / total if total > 0 else 0.0


def cosine_bert_similarity(a: str, b: str) -> float:
    """
    Calculate Cosine similarity between BERT embeddings of two drug names.
    """
    v1 = get_bert_embedding(a)
    v2 = get_bert_embedding(b)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    sim = np.dot(v1, v2) / (norm1 * norm2)
    return float(np.clip(sim, 0.0, 1.0))


def combined_similarity(a: str, b: str) -> float:
    """
    Calculate weighted combined similarity score using exact weights:
    lev=0.15, bisim=0.20, soundex=0.10, dice=0.10, metaphone=0.10, bert=0.35
    If (a, b) is a registered ISMP LASA pair, apply ISMP registry boost.
    """
    s1, s2 = preprocess(a), preprocess(b)
    
    # Check ISMP registry
    ismp_risk = _lasa_pairs_registry.get((s1, s2))
    if ismp_risk == "High":
        return 0.94
    elif ismp_risk == "Medium":
        return 0.78

    lev = levenshtein_similarity(a, b)
    bisim = bisim_similarity(a, b)
    snd = soundex_similarity(a, b)
    dice = dice_similarity(a, b)
    meta = metaphone_similarity(a, b)
    bert = cosine_bert_similarity(a, b)

    score = (
        0.15 * lev +
        0.20 * bisim +
        0.10 * snd +
        0.10 * dice +
        0.10 * meta +
        0.35 * bert
    )
    return float(np.clip(score, 0.0, 1.0))


def find_similar_drugs(input_name: str, drug_list: List[str], threshold: float = 0.4) -> List[Dict[str, Any]]:
    """
    Find drugs from drug_list that have combined similarity >= threshold.
    Returns list of dicts sorted descending by combined similarity score.
    """
    results = []
    clean_input = preprocess(input_name)

    for drug in drug_list:
        clean_drug = preprocess(drug)
        if clean_input == clean_drug:
            continue

        score = combined_similarity(input_name, drug)
        lev = levenshtein_similarity(input_name, drug)
        bisim = bisim_similarity(input_name, drug)
        snd = soundex_similarity(input_name, drug)
        dice = dice_similarity(input_name, drug)
        meta = metaphone_similarity(input_name, drug)
        bert = cosine_bert_similarity(input_name, drug)

        if score >= threshold:
            results.append({
                "brand_name": drug,
                "combined_score": round(score, 4),
                "levenshtein": round(lev, 4),
                "bisim": round(bisim, 4),
                "soundex": round(snd, 4),
                "dice": round(dice, 4),
                "metaphone": round(meta, 4),
                "bert_cosine": round(bert, 4)
            })

    results.sort(key=lambda x: x["combined_score"], reverse=True)
    return results
