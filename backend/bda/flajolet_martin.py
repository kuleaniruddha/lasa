import hashlib
import statistics
from typing import List, Dict, Any

class FlajoletMartin:
    """
    Flajolet-Martin algorithm for distinct element counting in data streams.
    Uses multiple hash functions and trailing zero analysis.
    """
    def __init__(self, num_hashes: int = 10):
        self.num_hashes = num_hashes
        # Store max trailing zeros R for each hash function
        self.max_R = [0] * num_hashes
        self.seen_items = set()

    def _trailing_zeros(self, val: int) -> int:
        """Count number of trailing zeros in binary representation of integer."""
        if val == 0:
            return 32
        count = 0
        while (val & 1) == 0:
            count += 1
            val >>= 1
        return count

    def _hash(self, item: str, seed: int) -> int:
        """Hash item to 32-bit integer using MD5 with seed salt."""
        salted = f"{seed}:{item.lower().strip()}".encode('utf-8')
        digest = hashlib.md5(salted).hexdigest()
        return int(digest[:8], 16)

    def add(self, item: str) -> None:
        """Process item into Flajolet-Martin stream counting engine."""
        item_str = str(item)
        self.seen_items.add(item_str)
        for i in range(self.num_hashes):
            h_val = self._hash(item_str, seed=i * 1000 + 42)
            tz = self._trailing_zeros(h_val)
            if tz > self.max_R[i]:
                self.max_R[i] = tz

    def estimate(self) -> int:
        """
        Estimate distinct elements count using median of 2^R estimates
        with correction factor (phi ~ 0.77351).
        """
        if not self.seen_items:
            return 0

        estimates = [ (2 ** r) / 0.77351 for r in self.max_R ]
        med = statistics.median(estimates)
        return int(round(med))

    def stats(self) -> Dict[str, Any]:
        """Return distinct count estimation metrics vs actual count."""
        return {
            "estimated_distinct": self.estimate(),
            "actual_distinct": len(self.seen_items),
            "num_hashes": self.num_hashes,
            "max_R_vector": self.max_R
        }
