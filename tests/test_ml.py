import pytest
import numpy as np
from backend.services.ml_service import (
    extract_features,
    train_random_forest,
    train_xgboost,
    train_ensemble,
    evaluate_model,
    train_kmeans
)

def test_extract_features():
    """Test 6-feature extraction for pair of drug names."""
    feats = extract_features("Celebrex", "Cerebyx")
    assert isinstance(feats, np.ndarray)
    assert feats.shape == (6,)
    assert np.all(feats >= 0.0) and np.all(feats <= 1.0)

def test_model_training_and_predict():
    """Test Random Forest, XGBoost, and Ensemble training and inference."""
    X = np.array([
        [0.85, 0.8, 1.0, 0.8, 1.0, 0.9],
        [0.90, 0.85, 1.0, 0.85, 1.0, 0.95],
        [0.1, 0.05, 0.0, 0.05, 0.0, 0.1],
        [0.15, 0.1, 0.0, 0.1, 0.0, 0.12]
    ], dtype=np.float32)
    y = np.array([1, 1, 0, 0], dtype=np.int32)

    rf = train_random_forest(X, y)
    xgb_clf = train_xgboost(X, y)
    ens = train_ensemble(X, y)

    prob_rf = rf.predict_proba(X[0:1])[:, 1][0]
    prob_xgb = xgb_clf.predict_proba(X[0:1])[:, 1][0]
    prob_ens = ens.predict_proba(X[0:1])[:, 1][0]

    assert prob_rf >= 0.5
    assert prob_xgb >= 0.5
    assert prob_ens >= 0.5

    metrics = evaluate_model(ens, X, y)
    assert "precision" in metrics
    assert "f1_score" in metrics

def test_kmeans_clustering():
    """Test KMeans clustering on drug name list."""
    drugs = ["Celebrex", "Cerebyx", "Losec", "Lasix", "Zyrtec", "Zantac"]
    kmeans, vectorizer = train_kmeans(drugs, n_clusters=3)
    assert kmeans is not None
    assert vectorizer is not None
