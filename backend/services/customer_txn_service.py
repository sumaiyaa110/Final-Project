from services.database import get_connection
from services.customer_profile_service import fetch_customer_transactions


def get_customer_transactions(customer_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    txns = fetch_customer_transactions(cursor, customer_id)

    conn.close()

    transactions = []

    for t in reversed(txns[-20:]):

        level = t["risk_level"]

        if level in ["HIGH", "CRITICAL"]:
            status = "Investigate"
        elif level == "MEDIUM":
            status = "Review"
        else:
            status = "Normal"

        transactions.append({

            "id": f"TXN-{t['id']}",

            "type": t["channel"],

            "amount": f"\u09f3{t['amount']:,.0f}",

            "risk": round(t["risk_score"], 0),

            "status": status,

            "time": t["timestamp"],

            "fraud_probability": t["fraud_probability"],

            "anomaly_score": t["anomaly_score"],

            "new_device": bool(t["new_device"]),

        })

    return transactions