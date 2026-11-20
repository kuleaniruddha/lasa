import os
import json
import numpy as np
import pandas as pd
import logging
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

from backend.config import Config
from backend.ml.feature_engineering import build_dataset
from backend.ml.train_random_forest import run_training as train_rf
from backend.ml.train_xgboost import run_training as train_xgb
from backend.ml.train_lstm import run_training as train_lstm
from backend.ml.ensemble import run_ensemble_training as train_ens
from backend.ml.kmeans_clustering import run_clustering
from backend.ml.pca_visualizer import generate_and_save_pca_plot
from backend.ml.evaluate import run_evaluation
from backend.services.nlp_service import get_bert_embedding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("train_all_models")

def train_all():
    """Train all machine learning models, scaler, clusterer, and export metrics & PCA plot."""
    os.makedirs(Config.MODEL_DIR, exist_ok=True)

    drugs_csv = os.path.join(Config.DATA_DIR, "drugs.csv")
    lasa_csv = os.path.join(Config.DATA_DIR, "lasa_pairs.csv")

    logger.info("Loading datasets...")
    drugs_df = pd.read_csv(drugs_csv)
    lasa_df = pd.read_csv(lasa_csv)

    logger.info("Extracting pair similarity features...")
    X, y = build_dataset(lasa_df, drugs_df, negative_ratio=5)
    logger.info(f"Dataset matrix shape: {X.shape}, labels distribution: {np.bincount(y)}")

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Fit Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    scaler_path = os.path.join(Config.MODEL_DIR, "scaler.pkl")
    joblib.dump(scaler, scaler_path)

    # 1. Train Random Forest
    rf_path = os.path.join(Config.MODEL_DIR, "random_forest.pkl")
    logger.info("Training Random Forest Classifier...")
    rf_model = train_rf(X_train_scaled, y_train, rf_path)

    # 2. Train XGBoost
    xgb_path = os.path.join(Config.MODEL_DIR, "xgboost.pkl")
    logger.info("Training XGBoost Classifier...")
    xgb_model = train_xgb(X_train_scaled, y_train, xgb_path)

    # 3. Train LSTM
    lstm_path = os.path.join(Config.MODEL_DIR, "lstm.h5")
    logger.info("Training LSTM Sequence Model...")
    lstm_model = train_lstm(X_train_scaled, y_train, lstm_path)

    # 4. Train Ensemble
    ens_path = os.path.join(Config.MODEL_DIR, "ensemble.pkl")
    logger.info("Training Voting Ensemble Classifier...")
    ens_model = train_ens(X_train_scaled, y_train, ens_path)

    # 5. Evaluate models
    logger.info("Evaluating models...")
    rf_metrics = run_evaluation(rf_model, X_test_scaled, y_test)
    xgb_metrics = run_evaluation(xgb_model, X_test_scaled, y_test)
    ens_metrics = run_evaluation(ens_model, X_test_scaled, y_test)

    metrics_summary = {
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "ensemble": ens_metrics,
        "total_samples": int(X.shape[0]),
        "feature_dim": int(X.shape[1])
    }

    metrics_path = os.path.join(Config.MODEL_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    logger.info(f"Saved evaluation metrics to {metrics_path}")

    # 6. Train KMeans and Save Embeddings
    drug_names = drugs_df["brand_name"].dropna().unique().tolist()
    kmeans_path = os.path.join(Config.MODEL_DIR, "kmeans.pkl")
    logger.info("Training KMeans Clustering model...")
    kmeans_model, _ = run_clustering(drug_names, kmeans_path, n_clusters=15)

    # Generate BERT embeddings for all drugs
    logger.info("Generating BERT embeddings matrix...")
    embeddings = np.array([get_bert_embedding(name) for name in drug_names], dtype=np.float32)
    emb_path = os.path.join(Config.MODEL_DIR, "bert_embeddings.npy")
    np.save(emb_path, embeddings)

    # 7. Generate PCA Plot
    pca_plot_path = os.path.join(Config.MODEL_DIR, "pca_plot.png")
    labels = kmeans_model.labels_ if hasattr(kmeans_model, "labels_") else [0]*len(drug_names)
    generate_and_save_pca_plot(embeddings, labels, pca_plot_path)
    logger.info(f"Generated PCA visualization plot at {pca_plot_path}")

    logger.info("✅ All ML models trained and artifacts saved successfully!")

if __name__ == "__main__":
    train_all()
