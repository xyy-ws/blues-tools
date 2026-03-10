NOISE_KEYWORDS = ['buy now', 'subscribe', 'promo code', 'discount link', 'giveaway']


def is_noise(text: str) -> bool:
    t = (text or '').lower()
    return any(k in t for k in NOISE_KEYWORDS)
