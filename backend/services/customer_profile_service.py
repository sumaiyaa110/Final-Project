"""
Customer behavior profiling.

All values are computed from the customer's real transaction history
(transactions_clean view, keyed by the real customer_id).
Nothing in here is hardcoded or simulated.
"""

import statistics
from collections import Counter
from datetime import datetime, timedelta


SUSPICIOUS_LEVELS = ("HIGH", "CRITICAL")

TIME_BUCKETS = (
    ("Night (00-05)", 0, 5),
    ("Morning (06-11)", 6, 11),
    ("Afternoon (12-17)", 12, 17),
    ("Evening (18-23)", 18, 23),
)

MIN_BASELINE = 3          # earlier transactions needed to build a baseline
MIN_HISTORY_FOR_HABITS = 5


def normalize_customer_id(customer_id):
    return (customer_id or "").strip()


def fetch_customer_transactions(cursor, customer_id, upto_id=None):
    """Return the customer's transactions, oldest first, as dicts."""

    customer_id = normalize_customer_id(customer_id)

    candidates = [customer_id]
    if customer_id and not customer_id.startswith("CUST-"):
        candidates.append(f"CUST-{customer_id}")

    placeholders = ",".join("?" for _ in candidates)
    params = list(candidates)

    sql = f"""
        SELECT id, timestamp, amount, channel, txn_hour, new_device_flag,
               fraud_probability, anomaly_score, risk_score, risk_level,
               customer_id, device_id
        FROM transactions_clean
        WHERE customer_id IN ({placeholders})
    """

    if upto_id is not None:
        sql += " AND id <= ?"
        params.append(upto_id)

    sql += " ORDER BY id ASC"

    cursor.execute(sql, params)

    rows = []
    for r in cursor.fetchall():
        rows.append({
            "id": r[0],
            "timestamp": r[1],
            "amount": float(r[2] or 0),
            "channel": r[3] or "Unknown",
            "hour": int(r[4]) if r[4] is not None else None,
            "new_device": bool(r[5]),
            "fraud_probability": float(r[6] or 0),
            "anomaly_score": float(r[7] or 0),
            "risk_score": float(r[8] or 0),
            "risk_level": (r[9] or "LOW").upper(),
            "customer_id": r[10],
            "device_id": r[11],
        })

    return rows


def is_suspicious(txn):
    return txn["risk_level"] in SUSPICIOUS_LEVELS


def classify_customer_risk(max_score, suspicious_count):
    """Customer-level risk, with the basis shown to the user."""

    if max_score >= 80 or suspicious_count >= 3:
        level = "High"
    elif suspicious_count >= 1 or max_score >= 50:
        level = "Medium"
    else:
        level = "Low"

    basis = (
        f"{suspicious_count} HIGH/CRITICAL transaction(s); "
        f"highest transaction risk score {round(max_score)}"
    )

    return level, basis


def _parse_ts(value):
    try:
        return datetime.fromisoformat(str(value))
    except (TypeError, ValueError):
        return None


def _bucket_for(hour):
    for label, lo, hi in TIME_BUCKETS:
        if hour is not None and lo <= hour <= hi:
            return label
    return None


def _circular_hour_gap(a, b):
    d = abs(a - b)
    return min(d, 24 - d)


def build_behavior_profile(txns):
    """
    Compare the most recent transaction ("current") against the
    customer's earlier transactions ("baseline").
    """

    if not txns:
        return {"available": False, "reason": "No transactions for this customer"}

    current = txns[-1]
    history = txns[:-1]

    suspicious = [t for t in txns if is_suspicious(t)]

    profile = {
        "available": True,
        "currentTransactionId": f"TXN-{current['id']}",
        "baselineSize": len(history),
        "baselineSufficient": len(history) >= MIN_BASELINE,
        "totalTransactions": len(txns),
        "suspicious": {
            "count": len(suspicious),
            "share": round(len(suspicious) / len(txns) * 100, 1),
            "recent": [
                {
                    "id": f"TXN-{t['id']}",
                    "amount": t["amount"],
                    "riskScore": round(t["risk_score"], 1),
                    "riskLevel": t["risk_level"].capitalize(),
                    "time": t["timestamp"],
                }
                for t in suspicious[-5:][::-1]
            ],
        },
    }

    # ---------- devices (available even with a tiny baseline) ----------
    device_counts = Counter(t["device_id"] for t in txns if t["device_id"])
    suspicious_devices = {t["device_id"] for t in suspicious if t["device_id"]}

    trusted = sorted(
        [d for d, c in device_counts.items() if c >= 2 and d not in suspicious_devices]
    )

    recent_devices = []
    for t in reversed(txns):
        d = t["device_id"]
        if d and d not in recent_devices:
            recent_devices.append(d)
        if len(recent_devices) >= 5:
            break

    profile["devices"] = {
        "distinct": len(device_counts),
        "trusted": trusted,
        "trustedRule": (
            "Used in at least 2 transactions by this customer, none flagged HIGH/CRITICAL"
        ),
        "recent": recent_devices,
    }

    # ---------- current transaction ----------
    profile["current"] = {
        "id": f"TXN-{current['id']}",
        "amount": current["amount"],
        "channel": current["channel"],
        "hour": current["hour"],
        "device": current["device_id"],
        "riskScore": round(current["risk_score"], 1),
        "riskLevel": current["risk_level"].capitalize(),
        "time": current["timestamp"],
    }

    if not history:
        profile["deviations"] = []
        profile["note"] = (
            "Only one transaction on record, so no behavioral baseline exists yet."
        )
        return profile

    # ---------- amounts ----------
    amounts = [t["amount"] for t in history]
    avg = statistics.fmean(amounts)
    std = statistics.pstdev(amounts) if len(amounts) > 1 else 0.0
    ratio = current["amount"] / avg if avg > 0 else None

    profile["amount"] = {
        "average": round(avg, 2),
        "median": round(statistics.median(amounts), 2),
        "stdDev": round(std, 2),
        "min": round(min(amounts), 2),
        "max": round(max(amounts), 2),
        "current": round(current["amount"], 2),
        "ratioToAverage": round(ratio, 2) if ratio is not None else None,
    }

    # ---------- frequency ----------
    stamps = [_parse_ts(t["timestamp"]) for t in history]
    stamps = [s for s in stamps if s]
    cur_ts = _parse_ts(current["timestamp"])

    active_days = len({s.date() for s in stamps}) if stamps else 0
    recent_24h = 0
    if cur_ts:
        window_start = cur_ts - timedelta(hours=24)
        recent_24h = sum(1 for s in stamps if window_start <= s <= cur_ts)

    profile["frequency"] = {
        "historyCount": len(history),
        "activeDays": active_days,
        "perActiveDay": round(len(history) / active_days, 2) if active_days else None,
        "previous24h": recent_24h,
    }

    # ---------- channels ----------
    ch_counts = Counter(t["channel"] for t in history)
    ch_total = sum(ch_counts.values())
    channels = [
        {"channel": c, "count": n, "share": round(n / ch_total * 100, 1)}
        for c, n in ch_counts.most_common()
    ]
    profile["channels"] = {
        "distribution": channels,
        "usual": [c["channel"] for c in channels if c["share"] >= 20],
    }

    # ---------- time of day ----------
    bucket_counts = Counter(
        _bucket_for(t["hour"]) for t in history if t["hour"] is not None
    )
    bucket_total = sum(bucket_counts.values())
    buckets = [
        {
            "bucket": label,
            "count": bucket_counts.get(label, 0),
            "share": round(bucket_counts.get(label, 0) / bucket_total * 100, 1)
            if bucket_total else 0,
        }
        for label, _, _ in TIME_BUCKETS
    ]
    usual_buckets = [b["bucket"] for b in buckets if b["share"] >= 25]
    profile["timeOfDay"] = {
        "distribution": buckets,
        "usual": usual_buckets,
        "lateNightShare": next(
            (b["share"] for b in buckets if b["bucket"].startswith("Night")), 0
        ),
    }

    # ---------- deviations ----------
    deviations = []
    enough_history = len(history) >= MIN_HISTORY_FOR_HABITS

    # amount
    if len(history) >= MIN_BASELINE and avg > 0:
        z = (current["amount"] - avg) / std if std > 0 else None
        triggered = ratio >= 3 or (z is not None and z >= 3)
        detail = f"Current amount {current['amount']:,.2f} vs customer average {avg:,.2f} ({ratio:.1f}x)"
        if z is not None:
            detail += f", z-score {z:.1f}"
        deviations.append({
            "code": "AMOUNT_DEVIATION",
            "label": "Unusual transaction amount",
            "detail": detail,
            "severity": "high" if triggered else "normal",
            "triggered": bool(triggered),
        })

    # hour
    if enough_history and current["hour"] is not None:
        hist_hours = [t["hour"] for t in history if t["hour"] is not None]
        nearest = min(_circular_hour_gap(current["hour"], h) for h in hist_hours)
        triggered = nearest > 1
        deviations.append({
            "code": "UNUSUAL_HOUR",
            "label": "Unusual transaction time",
            "detail": (
                f"Current hour {current['hour']:02d}:00; nearest previous activity "
                f"is {nearest}h away"
            ),
            "severity": "info" if triggered else "normal",
            "triggered": bool(triggered),
        })

    # channel
    if enough_history:
        triggered = current["channel"] not in ch_counts
        deviations.append({
            "code": "NEW_CHANNEL",
            "label": "Channel not previously used",
            "detail": (
                f"Current channel '{current['channel']}'; previously used: "
                f"{', '.join(ch_counts) or 'none'}"
            ),
            "severity": "medium" if triggered else "normal",
            "triggered": bool(triggered),
        })

    # device
    if current["device_id"]:
        prior_devices = {t["device_id"] for t in history if t["device_id"]}
        triggered = bool(prior_devices) and current["device_id"] not in prior_devices
        deviations.append({
            "code": "NEW_DEVICE_FOR_CUSTOMER",
            "label": "Device not previously used by this customer",
            "detail": (
                f"Current device {current['device_id']}; customer has used "
                f"{len(prior_devices)} other device(s)"
            ),
            "severity": "info" if triggered else "normal",
            "triggered": bool(triggered),
        })

    # frequency
    if cur_ts:
        triggered = recent_24h >= 5
        deviations.append({
            "code": "HIGH_FREQUENCY",
            "label": "Unusual transaction frequency",
            "detail": f"{recent_24h} transaction(s) in the 24 hours before the current one",
            "severity": "medium" if triggered else "normal",
            "triggered": bool(triggered),
        })

    profile["deviations"] = deviations

    if not profile["baselineSufficient"]:
        profile["note"] = (
            f"Baseline built from only {len(history)} earlier transaction(s); "
            "deviations are indicative only."
        )

    return profile

