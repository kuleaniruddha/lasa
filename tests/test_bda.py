import pytest
from backend.bda.bloom_filter import BloomFilter
from backend.bda.flajolet_martin import FlajoletMartin
from backend.bda.dgim import DGIM

def test_bloom_filter():
    """Test Bloom filter addition, membership check, and statistics."""
    bf = BloomFilter(size=1000, num_hashes=5)
    bf.add("celebrex")
    bf.add("losec")

    assert bf.contains("celebrex") is True
    assert bf.contains("losec") is True
    stats = bf.stats()
    assert stats["items_added"] == 2
    assert "false_positive_rate" in stats

def test_flajolet_martin():
    """Test Flajolet-Martin distinct counting estimation."""
    fm = FlajoletMartin(num_hashes=8)
    items = ["celebrex", "losec", "zyrtec", "celebrex", "lasix", "zyrtec", "clonidine"]
    for it in items:
        fm.add(it)

    est = fm.estimate()
    stats = fm.stats()
    assert est > 0
    assert stats["actual_distinct"] == 5

def test_dgim_sliding_window():
    """Test DGIM sliding window bucket counting."""
    dgim = DGIM(window_size=10)
    
    # Feed stream of 1s and 0s
    bits = [1, 0, 1, 1, 0, 1, 1, 1, 0, 1]
    for ts, bit in enumerate(bits, start=1):
        dgim.add(bit, timestamp=ts)

    count = dgim.count(timestamp=10)
    assert count > 0
    stats = dgim.stats()
    assert stats["window_size"] == 10
