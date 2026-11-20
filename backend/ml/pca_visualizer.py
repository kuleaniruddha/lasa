import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from typing import List

from backend.services.ml_service import reduce_pca

def generate_and_save_pca_plot(embeddings_or_features: np.ndarray, labels: List[int], save_path: str) -> str:
    """
    Generate 2D PCA scatter plot of drug feature embeddings color-coded by LASA risk clusters
    and save image artifact to models_saved/pca_plot.png.
    """
    coords = reduce_pca(embeddings_or_features)

    plt.figure(figsize=(8, 6), dpi=150)
    plt.style.use('default')
    
    scatter = plt.scatter(
        coords[:, 0],
        coords[:, 1],
        c=labels,
        cmap='tab10',
        alpha=0.8,
        edgecolors='w',
        s=60
    )
    plt.colorbar(scatter, label='Cluster ID / LASA Risk Class')
    plt.title("LASA Drug Embeddings - 2D PCA Projection", fontsize=14, fontweight='bold', pad=12, color='#003DA5')
    plt.xlabel("Principal Component 1", fontsize=10)
    plt.ylabel("Principal Component 2", fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight')
    plt.close()
    return save_path
