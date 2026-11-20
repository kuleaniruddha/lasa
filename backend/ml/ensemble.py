import numpy as np
from backend.services.ml_service import train_ensemble, save_model

def run_ensemble_training(X: np.ndarray, y: np.ndarray, save_path: str):
    """Train and save Voting Ensemble Classifier."""
    ensemble = train_ensemble(X, y)
    save_model(ensemble, save_path)
    return ensemble
