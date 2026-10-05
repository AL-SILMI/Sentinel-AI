"""
Core security utilities and normalization routines for SentinelAI.
Provides text canonicalization, zero-width stripping, leetspeak decoding,
and cryptographic/hash helpers.
"""
import re
import unicodedata

# Zero-width and invisible character stripping regex
ZERO_WIDTH_CHARS = re.compile(r"[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]")

LEETSPEAK_MAP = {
    "0": "o", "1": "i", "!": "i", "|": "i", "3": "e",
    "4": "a", "@": "a", "5": "s", "$": "s", "7": "t",
    "+": "t", "8": "b"
}

def normalize_text(text: str) -> str:
    """
    Normalizes potentially obfuscated input by:
    1. Stripping hidden/zero-width unicode characters
    2. NFKC unicode canonicalization
    3. Normalizing whitespace runs
    """
    if not text:
        return ""
    # Strip zero-width / invisible characters
    cleaned = ZERO_WIDTH_CHARS.sub("", text)
    # Unicode NFKC normalization
    cleaned = unicodedata.normalize("NFKC", cleaned)
    # Collapse multiple whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def decode_leetspeak(text: str) -> str:
    """
    Converts common leetspeak substitutions to standard characters.
    """
    chars = [LEETSPEAK_MAP.get(c, c) for c in text.lower()]
    return "".join(chars)
