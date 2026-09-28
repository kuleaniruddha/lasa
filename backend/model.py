"""
LASA-SAFE: AI-Powered LASA Medication Error Prevention System
Backend Hybrid Detection Model (Python / FastAPI)
Honours AIML Healthcare Project AY 2026-27
"""

import math
import re
from typing import Dict, List, Tuple, Optional

def levenshtein_distance(s1: str, s2: str) -> int:
    a, b = s1.lower().strip(), s2.lower().strip()
    matrix = [[i + j if i * j == 0 else 0 for j in range(len(b) + 1)] for i in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                matrix[i][j] = matrix[i - 1][j - 1]
            else:
                matrix[i][j] = min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1)
    return matrix[len(a)][len(b)]

def orthographic_similarity(s1: str, s2: str) -> float:
    a, b = s1.lower().strip(), s2.lower().strip()
    if not a and not b:
        return 100.0
    if not a or not b:
        return 0.0
    max_len = max(len(a), len(b))
    dist = levenshtein_distance(a, b)
    return max(0.0, min(100.0, round(((max_len - dist) / max_len) * 100.0, 1)))

def soundex(token: str) -> str:
    s = re.sub(r'[^A-Z]', '', token.upper())
    if not s:
        return "0000"
    mapping = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6'
    }
    code = [s[0]]
    prev = mapping.get(s[0], '0')
    for ch in s[1:]:
        curr = mapping.get(ch, '0')
        if curr != '0' and curr != prev:
            code.append(curr)
        prev = curr
        if len(code) == 4:
            break
    while len(code) < 4:
        code.append('0')
    return "".join(code[:4])

def phonetic_similarity(s1: str, s2: str) -> float:
    a, b = s1.lower().strip(), s2.lower().strip()
    if a == b:
        return 100.0
    code1 = soundex(a)
    code2 = soundex(b)
    score = 0.0
    if code1[0] == code2[0]:
        score += 35.0
    for i in range(1, 4):
        if code1[i] == code2[i]:
            score += 18.0
        elif code1[i] in code2:
            score += 8.0
    if a[:3] == b[:3]:
        score += 12.0
    return min(100.0, round(score, 1))

def calculate_poca_hybrid(ortho: float, phon: float, sem: float = 70.0) -> float:
    # FDA POCA standard: 45% Orthographic, 40% Phonetic, 15% Clinical Context
    return round((ortho * 0.45) + (phon * 0.40) + (sem * 0.15), 1)

def classify_risk(score: float) -> str:
    if score >= 80.0:
        return "High"
    if score >= 65.0:
        return "Medium"
    if score >= 50.0:
        return "Low"
    return "Clear"
