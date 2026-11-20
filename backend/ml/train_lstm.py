import numpy as np
from backend.services.ml_service import train_lstm, save_model

def run_training(X: np.ndarray, y: np.ndarray, save_path: str):
    """Train and save Keras LSTM sequence similarity model."""
    lstm_model = train_lstm(X, y)
    save_model(lstm_model, save_path)
    return lstm_model
