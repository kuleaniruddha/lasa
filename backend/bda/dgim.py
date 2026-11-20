import time
from typing import List, Tuple, Dict, Any

class DGIM:
    """
    Datar-Gionis-Indyk-Motwani (DGIM) algorithm for counting 1s in a sliding window.
    Maintains buckets of sizes (1, 2, 4, 8, ...), at most 2 buckets per size.
    """
    def __init__(self, window_size: int = 60):
        self.window_size = window_size
        # Buckets stored as list of dicts: {"timestamp": int, "size": int}
        # Ordered from newest to oldest
        self.buckets: List[Dict[str, int]] = []
        self.current_timestamp = 0

    def add(self, bit: int, timestamp: int | None = None) -> None:
        """
        Add a binary stream element (0 or 1) at given timestamp.
        If bit is 1, create a bucket of size 1 and merge if > 2 buckets of same size exist.
        """
        if timestamp is None:
            self.current_timestamp += 1
            timestamp = self.current_timestamp
        else:
            self.current_timestamp = max(self.current_timestamp, timestamp)

        # Expire old buckets outside window
        self._expire_old_buckets(timestamp)

        if bit != 1:
            return

        # Insert new bucket of size 1 at the beginning (newest)
        self.buckets.insert(0, {"timestamp": timestamp, "size": 1})

        # Compact buckets so max 2 buckets of any size exist
        self._compact_buckets()

    def _expire_old_buckets(self, current_time: int) -> None:
        """Remove buckets whose timestamp is older than (current_time - window_size)."""
        cutoff = current_time - self.window_size
        self.buckets = [b for b in self.buckets if b["timestamp"] > cutoff]

    def _compact_buckets(self) -> None:
        """Enforce DGIM rule: at most 2 buckets of any size. Merge 3rd into size 2*size."""
        i = 0
        while i < len(self.buckets) - 2:
            s1 = self.buckets[i]["size"]
            s2 = self.buckets[i+1]["size"]
            s3 = self.buckets[i+2]["size"]

            if s1 == s2 == s3:
                # Merge the oldest two of the three equal-sized buckets (indices i+1 and i+2)
                merged_size = s2 * 2
                merged_timestamp = self.buckets[i+2]["timestamp"]
                
                # Replace i+1 and i+2 with single merged bucket
                self.buckets[i+1] = {"timestamp": merged_timestamp, "size": merged_size}
                self.buckets.pop(i+2)
            else:
                i += 1

    def count(self, timestamp: int | None = None) -> int:
        """
        Estimate count of 1s in the sliding window.
        Sum size of all buckets except half the size of the oldest bucket.
        """
        if timestamp is None:
            timestamp = self.current_timestamp

        self._expire_old_buckets(timestamp)

        if not self.buckets:
            return 0

        total_count = 0
        for i, b in enumerate(self.buckets):
            if i == len(self.buckets) - 1:
                # Oldest bucket counted at half size
                total_count += b["size"] // 2
            else:
                total_count += b["size"]

        return total_count

    def stats(self) -> Dict[str, Any]:
        """Return DGIM window statistics and bucket state."""
        return {
            "window_size": self.window_size,
            "current_timestamp": self.current_timestamp,
            "total_buckets": len(self.buckets),
            "estimated_high_risk_count": self.count(),
            "bucket_sizes": [b["size"] for b in self.buckets]
        }
