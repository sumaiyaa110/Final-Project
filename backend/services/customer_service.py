from services.database import get_connection


def get_customers(device=None):
    """
    Customers grouped by their real customer_id (transactions_clean view).
    Optional `device` restricts to customers that used that device.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            customer_id,
            COUNT(*) AS transactions,
            MAX(timestamp) AS last_activity,
            SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS suspicious,
            MAX(risk_score) AS max_score,
            AVG(amount) AS avg_amount,
            SUM(amount) AS total_amount,
            COUNT(DISTINCT device_id) AS device_count
        FROM transactions_clean
        WHERE customer_id IS NOT NULL
        GROUP BY customer_id
        ORDER BY suspicious DESC, max_score DESC, transactions DESC
        LIMIT 2000
        """
    )
    rows = cursor.fetchall()

    # Most recent distinct devices per customer
    cursor.execute(
        """
        SELECT customer_id, device_id, MAX(id) AS last_id
        FROM transactions_clean
        WHERE customer_id IS NOT NULL AND device_id IS NOT NULL
        GROUP BY customer_id, device_id
        ORDER BY last_id DESC
        """
    )
    devices_by_customer = {}
    all_devices_by_customer = {}
    for cust, dev, _ in cursor.fetchall():
        all_devices_by_customer.setdefault(cust, set()).add(dev)
        lst = devices_by_customer.setdefault(cust, [])
        if len(lst) < 5:
            lst.append(dev)

    conn.close()

    # Local import avoids circular import at module load
    from services.customer_profile_service import classify_customer_risk

    customers = []

    for (cid, count, last_activity, suspicious, max_score,
         avg_amount, total_amount, device_count) in rows:

        if device and device not in all_devices_by_customer.get(cid, set()):
            continue

        level, _ = classify_customer_risk(
            float(max_score or 0), int(suspicious or 0)
        )

        devices = list(devices_by_customer.get(cid, []))
        if device and device not in devices:
            devices.append(device)

        customers.append({
            "id": cid,
            "name": f"Customer {cid}",
            "risk": level,
            "transactions": count,
            "lastActivity": last_activity,
            "status": "Active",
            "devices": devices,
            "suspicious": int(suspicious or 0),
            "avgAmount": round(float(avg_amount or 0), 2),
            "totalAmount": round(float(total_amount or 0), 2),
            "deviceCount": int(device_count or 0),
        })

    return customers