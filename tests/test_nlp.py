import pytest
from backend.services.nlp_service import (
    preprocess,
    tokenize,
    stem,
    levenshtein_similarity,
    bisim_similarity,
    soundex_similarity,
    metaphone_similarity,
    dice_similarity,
    cosine_bert_similarity,
    combined_similarity,
    find_similar_drugs
)

def test_preprocessing():
    """Test string lowercasing and punctuation stripping."""
    assert preprocess("Celebrex 200mg!") == "celebrex 200mg"
    assert preprocess("Losec-Lasix") == "loseclasix"

def test_tokenize_and_stem():
    """Test tokenization and stemming logic."""
    tokens = tokenize("Celebrex Omeprazole")
    assert len(tokens) >= 2
    stemmed = stem("inflammation")
    assert isinstance(stemmed, str)

def test_string_similarities_celebrex_cerebyx():
    """Test known LASA pair Celebrex vs Cerebyx."""
    lev = levenshtein_similarity("Celebrex", "Cerebyx")
    bisim = bisim_similarity("Celebrex", "Cerebyx")
    combined = combined_similarity("Celebrex", "Cerebyx")

    assert lev >= 0.6
    assert bisim >= 0.3
    assert combined >= 0.9

def test_string_similarities_losec_lasix():
    """Test known LASA pair Losec vs Lasix."""
    score = combined_similarity("Losec", "Lasix")
    assert score >= 0.7

def test_string_similarities_zyrtec_zantac():
    """Test known LASA pair Zyrtec vs Zantac."""
    score = combined_similarity("Zyrtec", "Zantac")
    assert score >= 0.7

def test_find_similar_drugs():
    """Test candidate search against drug list."""
    drug_list = ["Cerebyx", "Lasix", "Zantac", "Amoxicillin"]
    matches = find_similar_drugs("Celebrex", drug_list, threshold=0.4)
    assert len(matches) > 0
    assert matches[0]["brand_name"] == "Cerebyx"
