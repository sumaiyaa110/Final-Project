from services.database import get_connection
from services.customer_profile_service import (
    fetch_customer_transactions,
    classify_customer_risk,
    build_behavior_profile,
    is_suspicious,
)


def get_customer_detail(customer_id):
    """
    Customer summary computed from the customer's real transactions.
    Returns None when the customer has no transactions.
    """

    conn = get_connection()
    cursor = conn.cursor()

    txns = fetch_customer_transactions(cursor, customer_id)

    conn.close()

    if not txns:
        return None

    real_id = txns[-1]["customer_id"]

    total_amount = sum(t["amount"] for t in txns)
    scores = [t["risk_score"] for t in txns]
    max_score = max(scores)
    avg_score = sum(scores) / len(scores)
    suspicious = sum(1 for t in txns if is_suspicious(t))

    level, basis = classify_customer_risk(max_score, suspicious)

    first_ts = txns[0]["timestamp"] or ""

    return {

        "id": real_id,

        "name": f"Customer {real_id}",

        "phone": "+880 **********",

        "risk": level,

        "riskScore": round(max_score),

        "averageRiskScore": round(avg_score, 1),

        "riskBasis": basis,

        "status": "Active",

        "totalTransactions": len(txns),

        "totalAmount": total_amount,

        "fraudAlerts": suspicious,

        "lastActivity": txns[-1]["timestamp"],

        "customerSince": first_ts[:10] if first_ts else "Unknown",

        "latestSuspiciousTransactionId": next(
            (f"TXN-{t['id']}" for t in reversed(txns) if is_suspicious(t)),
            None
        ),

        "behavior": build_behavior_profile(txns),

    }