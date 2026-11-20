import numpy as np
import pandas as pd
from typing import Tuple
from backend.services.ml_service import extract_features

def build_dataset(lasa_pairs_df: pd.DataFrame, drugs_df: pd.DataFrame, negative_ratio: int = 5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Build positive (LASA pairs) and negative (random non-similar drug pairs) dataset matrix X and labels y.
    Extracts 6 features per pair.
    """
    X_list = []
    y_list = []

    # Positive pairs
    for _, row in lasa_pairs_df.iterrows():
        d1, d2 = str(row["drug1"]), str(row["drug2"])
        feats = extract_features(d1, d2)
        X_list.append(feats)
        y_list.append(1)

    # Negative pairs (random sampling from drugs_df)
    drug_names = drugs_df["brand_name"].dropna().unique().tolist()
    np.random.seed(42)
    num_negatives = len(lasa_pairs_df) * negative_ratio
    
    count = 0
    while count < num_negatives:
        idx1, idx2 = np.random.choice(len(drug_names), 2, replace=False)
        d1, d2 = drug_names[idx1], drug_names[idx2]
        
        # Ensure not already a positive pair
        feats = extract_features(d1, d2)
        # If similarity score is very low (< 0.4), it's a valid negative pair
        if feats[0] < 0.4:
            X_list.append(feats)
            y_list.append(0)
            count += 1

    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.int32)
