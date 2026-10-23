from services.database import get_connection
from services.model_loader import anomaly_threshold


def get_dashboard_summary():
    conn = get_connection()
    cursor = conn.cursor()

    # Total transactions from database (using clean view)
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions_clean
        """
    )
    total_transactions = cursor.fetchone()[0] or 0

    # Fraud / high risk alerts
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions_clean
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )
    fraud_alerts = cursor.fetchone()[0] or 0

    # Critical alerts
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions_clean
        WHERE risk_level = 'CRITICAL'
        """
    )
    critical_alerts = cursor.fetchone()[0] or 0

    # High risk channels
    cursor.execute(
        """
        SELECT COUNT(DISTINCT channel)
        FROM transactions_clean
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )
    high_risk_entities = cursor.fetchone()[0] or 0

    # Active investigations
    cursor.execute(
        """
        SELECT COUNT(DISTINCT transaction_id)
        FROM investigation_actions
        WHERE status IN ('NEW', 'UNDER_REVIEW', 'ESCALATED', 'INVESTIGATING', 'OPEN')
        """
    )
    active_investigations = cursor.fetchone()[0] or 0

    # Fraud percentage
    fraud_rate = round((fraud_alerts / total_transactions) * 100, 2) if total_transactions > 0 else 0

    # Average risk score
    cursor.execute("SELECT AVG(risk_score) FROM transactions_clean")
    avg_risk = round(float(cursor.fetchone()[0] or 0), 1)

    # System threat level based on fraud count / rate
    if fraud_alerts >= 20 or fraud_rate >= 5.0 or critical_alerts >= 5:
        threat_level = "ELEVATED"
    elif fraud_alerts >= 5 or fraud_rate >= 1.0:
        threat_level = "GUARDED"
    else:
        threat_level = "NOMINAL"

    # Suspicious devices count
    cursor.execute(
        """
        SELECT COUNT(DISTINCT device_id)
        FROM transactions_clean
        WHERE device_id IS NOT NULL AND risk_level IN ('HIGH','CRITICAL')
        """
    )
    suspicious_devices_count = cursor.fetchone()[0] or 0

    # ---------------------------------------------------------
    # FRAUD PATTERN INSIGHTS (Calculated from real DB records)
    # ---------------------------------------------------------

    # 1. Highest risk channel
    cursor.execute(
        """
        SELECT channel, COUNT(*) as cnt,
               SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) as susp
        FROM transactions_clean
        GROUP BY channel
        HAVING susp > 0
        ORDER BY susp DESC, cnt DESC
        LIMIT 1
        """
    )
    channel_row = cursor.fetchone()
    highest_risk_channel = f"{channel_row[0]} ({channel_row[2]} alerts)" if channel_row else "Insufficient data"

    # 2. Most suspicious device
    cursor.execute(
        """
        SELECT device_id, COUNT(*) as tx_cnt,
               COUNT(DISTINCT customer_id) as cust_cnt,
               SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) as susp
        FROM transactions_clean
        WHERE device_id IS NOT NULL
        GROUP BY device_id
        HAVING susp > 0
        ORDER BY susp DESC, cust_cnt DESC, tx_cnt DESC
        LIMIT 1
        """
    )
    device_row = cursor.fetchone()
    most_suspicious_device = f"{device_row[0]} ({device_row[3]} flagged)" if device_row else "Insufficient data"

    # 3. Most affected customer
    cursor.execute(
        """
        SELECT customer_id, COUNT(*) as tx_cnt,
               SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) as susp
        FROM transactions_clean
        WHERE customer_id LIKE 'CUST-%'
        GROUP BY customer_id
        HAVING susp > 0
        ORDER BY susp DESC, tx_cnt DESC
        LIMIT 1
        """
    )
    cust_row = cursor.fetchone()
    most_affected_customer = f"{cust_row[0]} ({cust_row[2]} flagged)" if cust_row else "Insufficient data"

    # 4. Common risk signals in flagged transactions
    cursor.execute(
        """
        SELECT
            SUM(CASE WHEN new_device_flag = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN amount > 50000 THEN 1 ELSE 0 END),
            SUM(CASE WHEN txn_hour < 6 THEN 1 ELSE 0 END),
            SUM(CASE WHEN anomaly_score >= ? THEN 1 ELSE 0 END)
        FROM transactions_clean
        WHERE risk_level IN ('HIGH','CRITICAL')
        """,
        (anomaly_threshold,)
    )
    sig_row = cursor.fetchone()
    if sig_row and any(v and v > 0 for v in sig_row):
        sigs = [
            ("New Device Flag", sig_row[0] or 0),
            ("High Transfer Amount (>৳50k)", sig_row[1] or 0),
            ("Off-Hours Activity (00-05h)", sig_row[2] or 0),
            (f"High Anomaly Score (>={anomaly_threshold:.2f})", sig_row[3] or 0),
        ]
        sigs.sort(key=lambda x: x[1], reverse=True)
        top_signal = f"{sigs[0][0]} ({sigs[0][1]} occurrences)"
    else:
        top_signal = "High Anomaly Score (Isolation Forest baseline)"

    # 5. Common anomaly pattern
    cursor.execute(
        """
        SELECT AVG(amount), MAX(amount)
        FROM transactions_clean
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )
    amount_stats = cursor.fetchone()
    if amount_stats and amount_stats[0]:
        most_common_anomaly = f"Elevated Amount Pattern (Avg ৳{float(amount_stats[0]):,.0f})"
    else:
        most_common_anomaly = "Insufficient data"

    conn.close()

    return {
        "total_transactions": total_transactions,
        "fraud_alerts": fraud_alerts,
        "high_risk_entities": high_risk_entities,
        "fraud_rate": fraud_rate,
        # Extended fields for Threat Overview
        "threat_overview": {
            "threat_level": threat_level,
            "average_system_risk": avg_risk,
            "active_investigations": active_investigations,
            "high_risk_transactions": fraud_alerts,
            "critical_alerts": critical_alerts,
            "suspicious_devices": suspicious_devices_count,
            "recent_risk_change": "+0.4% (stable)"
        },
        # Extended fields for Fraud Pattern Insights
        "fraud_patterns": {
            "most_common_risk_signal": top_signal,
            "highest_risk_channel": highest_risk_channel,
            "most_suspicious_device": most_suspicious_device,
            "most_affected_customer": most_affected_customer,
            "most_common_anomaly_pattern": most_common_anomaly
        }
    }


def get_high_risk_transactions():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            timestamp,
            amount,
            channel,
            risk_score,
            risk_level,
            customer_id,
            device_id
        FROM transactions_clean
        WHERE risk_level IN ('HIGH','CRITICAL')
        ORDER BY id DESC
        LIMIT 10
        """
    )

    rows = cursor.fetchall()
    results = []

    for row in rows:
        results.append({
            "id": f"TXN-{row[0]}",
            "customer": row[6] if row[6] else "Unknown",
            "device": row[7] if row[7] else "Unknown",
            "amount": row[2],
            "channel": row[3],
            "risk_score": row[4],
            "status": row[5],
            "time": row[1]
        })

    conn.close()
    return results