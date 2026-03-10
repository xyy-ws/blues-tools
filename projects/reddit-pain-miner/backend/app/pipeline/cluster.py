from collections import Counter

STOPWORDS = set(['the', 'and', 'for', 'this', 'that', 'with', 'are', 'too', 'our', 'after', 'from'])


def cluster_theme(text: str) -> str:
    words = [w for w in text.split() if len(w) > 3 and w not in STOPWORDS]
    if not words:
        return 'general'
    most = Counter(words).most_common(1)[0][0]
    return most
