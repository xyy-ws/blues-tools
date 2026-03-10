CATEGORIES = {
    'pricing': ['price', 'pricing', 'cost', 'fee', 'expensive', 'margin'],
    'process': ['onboarding', 'workflow', 'process', 'step', 'approval', 'setup', 'ticket'],
    'function': ['feature', 'bug', 'broken', 'error', 'sync', 'api', 'integration', 'failing'],
}


def classify_category(text: str) -> str:
    scores = {cat: sum(1 for k in keys if k in text) for cat, keys in CATEGORIES.items()}
    return max(scores, key=scores.get) if any(scores.values()) else 'process'
