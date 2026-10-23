from services.database import get_connection


def get_transactions():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            timestamp,
            amount,
            channel,
            txn_hour,
            new_device_flag,
            fraud_probability,
            anomaly_score,
            risk_score,
            risk_level,
            customer_id,
            device_id,
            alert_status
        FROM transactions_clean
        ORDER BY id DESC
        LIMIT 500
        """
    )

    rows = cursor.fetchall()
    conn.close()

    transactions = []

    for row in rows:
        txn_id = row[0]
        timestamp = row[1]
        amount = float(row[2] or 0)
        channel = row[3] or "Unknown"
        risk_score = float(row[8] or 0)
        risk_level = (row[9] or "LOW").upper()
        customer_id = row[10]
        device_id = row[11]

        if risk_level in ["HIGH", "CRITICAL"]:
            status = "Investigate"
        elif risk_level == "MEDIUM":
            status = "Review"
        else:
            status = "Normal"

        transactions.append({
            "id": f"TXN-{txn_id}",
            "type": channel,
            "amount": f"\u09f3{amount:,.0f}",
            "score": round(risk_score, 0),
            "level": risk_level.capitalize(),
            "status": status,
            "customer": customer_id if customer_id else "Unknown",
            "device": device_id if device_id else "Unknown",
            "time": timestamp if timestamp else "Unknown"
        })

    return transactions