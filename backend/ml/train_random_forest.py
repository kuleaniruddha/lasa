import numpy as np
from backend.services.ml_service import train_random_forest, save_model

def run_training(X: np.ndarray, y: np.ndarray, save_path: str):
    """Train and save Random Forest Classifier model."""
    rf = train_random_forest(X, y)
    save_model(rf, save_path)
    return rf
