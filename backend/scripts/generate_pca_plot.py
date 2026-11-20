import os
import numpy as np
import pandas as pd
import logging
from backend.config import Config
from backend.ml.pca_visualizer import generate_and_save_pca_plot
from backend.services.nlp_service import get_bert_embedding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("generate_pca_plot")

def main():
    """Standalone script to regenerate PCA visualization scatter plot."""
    drugs_csv = os.path.join(Config.DATA_DIR, "drugs.csv")
    if not os.path.exists(drugs_csv):
        logger.error("data/drugs.csv missing.")
        return

    df = pd.read_csv(drugs_csv)
    drug_names = df["brand_name"].dropna().unique().tolist()

    embeddings = np.array([get_bert_embedding(name) for name in drug_names], dtype=np.float32)
    # Simple hash cluster mapping
    labels = [hash(name) % 15 for name in drug_names]

    out_path = os.path.join(Config.MODEL_DIR, "pca_plot.png")
    generate_and_save_pca_plot(embeddings, labels, out_path)
    logger.info(f"PCA scatter plot exported to {out_path}")

if __name__ == "__main__":
    main()
