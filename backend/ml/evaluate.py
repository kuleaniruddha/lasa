import numpy as np
from typing import Dict, Any
from backend.services.ml_service import evaluate_model

def run_evaluation(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
    """Calculate and return evaluation metrics."""
    return evaluate_model(model, X_test, y_test)
