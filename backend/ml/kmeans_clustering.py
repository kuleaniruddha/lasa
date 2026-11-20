from typing import Any, List, Tuple
from backend.services.ml_service import train_kmeans, save_model

def run_clustering(drug_names: List[str], save_path: str, n_clusters: int = 15) -> Tuple[Any, Any]:
    """Train and save KMeans drug name clustering model."""
    kmeans, vectorizer = train_kmeans(drug_names, n_clusters=n_clusters)
    save_model({"kmeans": kmeans, "vectorizer": vectorizer}, save_path)
    return kmeans, vectorizer
