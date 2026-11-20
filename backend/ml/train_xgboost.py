import numpy as np
from backend.services.ml_service import train_xgboost, save_model

def run_training(X: np.ndarray, y: np.ndarray, save_path: str):
    """Train and save XGBoost Classifier model."""
    xgb_clf = train_xgboost(X, y)
    save_model(xgb_clf, save_path)
    return xgb_clf
