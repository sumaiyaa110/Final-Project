from services.database import get_connection


def get_transaction_detail(transaction_id):
    conn = get_connection()
    cursor = conn.cursor()

    real_id = str(transaction_id).replace("TXN-", "").strip()

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
        WHERE id = ?
        """,
        (real_id,)
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "error": "Transaction not found"
        }

    txn_id = row[0]
    timestamp = row[1]
    amount = float(row[2] or 0)
    channel = row[3] or "Unknown"
    new_device_flag = int(row[5] or 0)
    fraud_prob = float(row[6] or 0)
    anomaly_score = float(row[7] or 0)
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

    # Rule-based context reasons for summary
    reasons = []
    if risk_score >= 70:
        reasons.append("High risk score detected")
    if new_device_flag == 1:
        reasons.append("New device used for transaction")
    if amount > 50000:
        reasons.append("Unusually high transaction amount")
    if channel in ["Cash-Out", "Transfer"]:
        reasons.append("High risk transaction channel")
    if anomaly_score > 0.4:
        reasons.append("Abnormal transaction behaviour detected")
    if len(reasons) == 0:
        reasons.append("No major suspicious pattern detected")

    return {
        "id": f"TXN-{txn_id}",
        "type": channel,
        "amount": f"\u09f3{amount:,.0f}",
        "raw_amount": amount,
        "score": risk_score,
        "level": risk_level.capitalize(),
        "status": status,
        "customer": customer_id if customer_id else "Unknown",
        "device": device_id if device_id else "Unknown",
        "time": timestamp or "",
        "fraud_probability": fraud_prob,
        "anomaly_score": anomaly_score,
        "new_device": new_device_flag,
        "reasons": reasons
    }