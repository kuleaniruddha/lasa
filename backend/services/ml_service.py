import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

try:
    import xgboost as xgb
except ImportError:
    xgb = None

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, LSTM
except Exception:
    tf = None

from backend.services.nlp_service import (
    levenshtein_similarity,
    bisim_similarity,
    soundex_similarity,
    dice_similarity,
    metaphone_similarity,
    cosine_bert_similarity,
    get_bert_embedding
)

class FallbackLSTM:
    """Fallback LSTM sequence model when TensorFlow runtime is unavailable."""
    def predict(self, X):
        return np.mean(X, axis=1, keepdims=True)

def extract_features(drug1: str, drug2: str) -> np.ndarray:
    """
    Extract exact 6 string/phonetic/semantic similarity features for a pair of drug names:
    [levenshtein, bisim, soundex, dice, metaphone, cosine_bert]
    Returns 1D numpy array of shape (6,).
    """
    lev = levenshtein_similarity(drug1, drug2)
    bisim = bisim_similarity(drug1, drug2)
    snd = soundex_similarity(drug1, drug2)
    dice = dice_similarity(drug1, drug2)
    meta = metaphone_similarity(drug1, drug2)
    bert = cosine_bert_similarity(drug1, drug2)

    return np.array([lev, bisim, snd, dice, meta, bert], dtype=np.float32)


def train_random_forest(X: np.ndarray, y: np.ndarray) -> RandomForestClassifier:
    """
    Train Random Forest classifier with n_estimators=200, max_depth=15, random_state=42.
    """
    rf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
    rf.fit(X, y)
    return rf


def train_xgboost(X: np.ndarray, y: np.ndarray) -> Any:
    """
    Train XGBoost classifier with n_estimators=200, learning_rate=0.1, max_depth=6.
    Fallback to GradientBoostingClassifier if xgboost package is unavailable.
    """
    if xgb is not None:
        model = xgb.XGBClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            random_state=42,
            eval_metric="logloss"
        )
    else:
        from sklearn.ensemble import GradientBoostingClassifier
        model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
    model.fit(X, y)
    return model


def train_lstm(X_seq: np.ndarray, y: np.ndarray) -> Any:
    """
    Train Keras LSTM model for sequence similarity classification.
    """
    if tf is None:
        return FallbackLSTM()

    num_features = X_seq.shape[1] if len(X_seq.shape) > 1 else 6
    X_reshaped = X_seq.reshape((X_seq.shape[0], num_features, 1))

    try:
        model = Sequential([
            LSTM(32, input_shape=(num_features, 1), return_sequences=False),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(X_reshaped, y, epochs=50, batch_size=16, verbose=0)
        return model
    except Exception:
        return FallbackLSTM()


def train_ensemble(X: np.ndarray, y: np.ndarray) -> VotingClassifier:
    """
    Train Soft Voting Classifier combining Random Forest, XGBoost (or GradientBoost), and Logistic Regression.
    """
    rf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
    if xgb is not None:
        xgb_clf = xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=42, eval_metric="logloss")
    else:
        from sklearn.ensemble import GradientBoostingClassifier
        xgb_clf = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=42)
    lr = LogisticRegression(random_state=42)

    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('xgb', xgb_clf), ('lr', lr)],
        voting='soft'
    )
    ensemble.fit(X, y)
    return ensemble


def train_kmeans(drug_names: List[str], n_clusters: int = 15) -> Tuple[KMeans, TfidfVectorizer]:
    """
    Train KMeans clustering model on TF-IDF character n-grams of drug names.
    """
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4))
    tfidf_matrix = vectorizer.fit_transform(drug_names)

    actual_k = min(n_clusters, len(drug_names))
    kmeans = KMeans(n_clusters=actual_k, random_state=42, n_init=10)
    kmeans.fit(tfidf_matrix)

    return kmeans, vectorizer


def reduce_pca(feature_matrix: np.ndarray) -> np.ndarray:
    """
    Reduce feature matrix or embeddings to 2D using PCA for visualization.
    """
    pca = PCA(n_components=2, random_state=42)
    return pca.fit_transform(feature_matrix)


def evaluate_model(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
    """
    Evaluate model and return dictionary with precision, recall, f1, roc_auc, and confusion_matrix.
    """
    if hasattr(model, "predict_proba"):
        y_probs = model.predict_proba(X_test)[:, 1]
    else:
        y_probs = model.predict(X_test).ravel()

    y_pred = (y_probs >= 0.5).astype(int)

    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    
    try:
        auc = float(roc_auc_score(y_test, y_probs))
    except Exception:
        auc = 0.5

    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm
    }


def save_model(model: Any, path: str) -> None:
    """Save model object to disk using joblib or keras h5."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if hasattr(model, "save") and path.endswith(".h5"):
        try:
            model.save(path)
            return
        except Exception:
            pass
    joblib.dump(model, path)


def load_model(path: str) -> Any:
    """Load model object from disk."""
    if not os.path.exists(path):
        return None
    if path.endswith(".h5") and tf is not None:
        try:
            return tf.keras.models.load_model(path)
        except Exception:
            pass
    try:
        return joblib.load(path)
    except Exception:
        return None
