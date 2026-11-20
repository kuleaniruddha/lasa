import hashlib
import math
from typing import Dict, Any

class BloomFilter:
    """
    Space-efficient probabilistic data structure for set membership testing.
    Uses MD5, SHA1, SHA256, and kirsch-mitzenmacher double hashing for multi-hash calculation.
    """
    def __init__(self, size: int = 20000, num_hashes: int = 7):
        self.size = size
        self.num_hashes = num_hashes
        self.bit_array = [0] * size
        self.items_added = 0

    def _hashes(self, item: str) -> list[int]:
        """Generate num_hashes bit array indices using MD5, SHA1, and double hashing."""
        clean_item = str(item).lower().strip().encode('utf-8')
        
        # Base hash values
        h1 = int(hashlib.md5(clean_item).hexdigest(), 16)
        h2 = int(hashlib.sha1(clean_item).hexdigest(), 16)
        h3 = int(hashlib.sha256(clean_item).hexdigest(), 16)

        indices = []
        for i in range(self.num_hashes):
            # Kirsch-Mitzenmacher double hashing technique
            combined_hash = (h1 + i * h2 + i * i * h3) % self.size
            indices.append(combined_hash)
        return indices

    def add(self, item: str) -> None:
        """Add item to the Bloom filter."""
        for idx in self._hashes(item):
            self.bit_array[idx] = 1
        self.items_added += 1

    def contains(self, item: str) -> bool:
        """Check if item might exist in the filter."""
        for idx in self._hashes(item):
            if self.bit_array[idx] == 0:
                return False
        return True

    def stats(self) -> Dict[str, Any]:
        """Return operational statistics including theoretical false positive rate."""
        # False positive rate calculation: (1 - e^(-k*n/m))^k
        k = self.num_hashes
        n = self.items_added
        m = self.size
        
        if n == 0:
            fpr = 0.0
        else:
            fpr = (1.0 - math.exp(-k * n / m)) ** k

        return {
            "size": m,
            "num_hashes": k,
            "items_added": n,
            "false_positive_rate": round(fpr, 6),
            "bits_set": sum(self.bit_array)
        }
