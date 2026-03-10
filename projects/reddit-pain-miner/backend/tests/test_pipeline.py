from datetime import date

from app.pipeline.processor import classify_category, process_post


def test_category_pricing():
    assert classify_category('pricing and fees are expensive') == 'pricing'


def test_process_post_shape():
    out = process_post('Onboarding process is frustrating and long', date.today())
    assert out.category in {'process', 'function', 'pricing'}
    assert -1 <= out.sentiment <= 1
    assert 0 <= out.intensity <= 1
