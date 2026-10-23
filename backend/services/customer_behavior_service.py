from services.database import get_connection
from services.customer_profile_service import fetch_customer_transactions


def get_customer_behavior(customer_id, transaction_id=None):
    """
    Last 10 transactions of this customer, oldest first.
    If transaction_id is given, that transaction is the last ("current") item.
    """

    upto = None

    if transaction_id:
        raw = str(transaction_id).replace("TXN-", "")
        if raw.isdigit():
            upto = int(raw)

    conn = get_connection()
    cursor = conn.cursor()

    txns = fetch_customer_transactions(cursor, customer_id, upto_id=upto)

    conn.close()

    return [
        {
            "id": f"TXN-{t['id']}",
            "amount": t["amount"],
            "riskScore": t["risk_score"],
            "riskLevel": t["risk_level"].capitalize(),
            "time": t["timestamp"],
        }
        for t in txns[-10:]
    ]