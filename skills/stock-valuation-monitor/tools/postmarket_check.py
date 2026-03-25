#!/usr/bin/env python3
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main  # noqa


def judge(item):
    zone = item.get("zone", "")
    sources = item.get("sources") or item.get("data_sources") or []
    if zone == "数据不足" or len(sources) <= 1:
        return "OBSERVE", "数据不足/单源数据，按规则仅观察不交易"
    return "REVIEW", "可进入人工复核，不可自动下单"


def run(codes):
    req = {"message": "查询" + "、".join(codes), "export": "json", "timeout": 60}
    resp = main.handle(req)
    out = {
        "status": resp.get("status"),
        "code": resp.get("code"),
        "items": []
    }
    if resp.get("status") != "success":
        out["error"] = resp.get("message")
        return out

    try:
        data = json.loads(resp.get("message") or "[]")
    except Exception:
        out["error"] = "json parse failed"
        return out

    for item in data:
        action, reason = judge(item)
        out["items"].append({
            "symbol": item.get("code"),
            "zone": item.get("zone"),
            "sources": item.get("sources") or item.get("data_sources") or [],
            "action": action,
            "reason": reason,
        })
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: postmarket_check.py 510300 159981 515220")
        sys.exit(1)
    result = run(sys.argv[1:])
    print(json.dumps(result, ensure_ascii=False, indent=2))
