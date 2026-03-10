NEGATIVE_WORDS = ['hate', 'terrible', 'frustrating', 'awful', 'angry', 'killing', 'pain', 'churn', 'failing']
POSITIVE_WORDS = ['good', 'great', 'love', 'nice', 'easy', 'fast']


def sentiment_intensity(text: str) -> tuple[float, float]:
    neg = sum(text.count(w) for w in NEGATIVE_WORDS)
    pos = sum(text.count(w) for w in POSITIVE_WORDS)
    score = (pos - neg) / max(1, pos + neg)
    intensity = min(1.0, (pos + neg) / 3)
    return score, intensity
