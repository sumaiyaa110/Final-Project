from services.database import get_connection


# =========================================================
# GET ALL DEVICES
# =========================================================

def get_devices():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            device_id,
            os_type,
            model,
            risk,
            linked_accounts,
            transaction_count,
            last_activity,
            status

        FROM devices

        ORDER BY
            CASE risk
                WHEN 'Critical' THEN 1
                WHEN 'High' THEN 2
                WHEN 'Medium' THEN 3
                ELSE 4
            END,

            transaction_count DESC

        LIMIT 1000
        """
    )

    rows = cursor.fetchall()

    conn.close()

    devices = []

    for row in rows:

        devices.append(
            {
                "id": row[0],
                "type": row[1],
                "model": row[2],
                "risk": row[3],
                "accounts": int(row[4] or 0),
                "transactions": int(row[5] or 0),
                "lastActivity": row[6],
                "status": row[7]
            }
        )

    return devices


# =========================================================
# GET SINGLE DEVICE DETAILS
# =========================================================

def _customer_level(max_score, suspicious):
    if max_score >= 80 or suspicious >= 3:
        return "High"
    if suspicious >= 1 or max_score >= 50:
        return "Medium"
    return "Low"


def get_device_detail(device_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    # -----------------------------------------------------
    # DEVICE REGISTRY ENTRY
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT
            device_id, os_type, model, risk, linked_accounts,
            transaction_count, last_activity, status
        FROM devices
        WHERE device_id = ?
        LIMIT 1
        """,
        (device_id,)
    )

    row = cursor.fetchone()

    # -----------------------------------------------------
    # TRANSACTION-DERIVED AGGREGATES
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT
            COUNT(*),
            COALESCE(SUM(amount), 0),
            SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END),
            MIN(timestamp),
            MAX(timestamp),
            MAX(risk_score),
            AVG(risk_score)
        FROM transactions_clean
        WHERE device_id = ?
        """,
        (device_id,)
    )

    agg = cursor.fetchone()

    txn_count = int(agg[0] or 0)

    if not row and txn_count == 0:
        conn.close()
        return None

    if row:
        device = {
            "id": row[0],
            "type": row[1],
            "model": row[2],
            "risk": row[3],
            "accounts": int(row[4] or 0),
            "transactions": int(row[5] or 0),
            "lastActivity": row[6],
            "status": row[7],
            "inRegistry": True,
        }
    else:
        device = {
            "id": device_id,
            "type": None,
            "model": None,
            "risk": None,
            "accounts": 0,
            "transactions": 0,
            "lastActivity": agg[4],
            "status": None,
            "inRegistry": False,
        }

    device["actualTransactions"] = txn_count
    device["totalAmount"] = float(agg[1] or 0)
    device["suspiciousTransactions"] = int(agg[2] or 0)
    device["highRiskTransactions"] = int(agg[2] or 0)
    device["firstSeen"] = agg[3]
    device["lastTransactionAt"] = agg[4]
    device["riskScore"] = round(float(agg[5] or 0)) if txn_count else None
    device["averageRiskScore"] = round(float(agg[6] or 0), 1) if txn_count else None
    device["riskScoreBasis"] = (
        "Highest risk score among transactions made on this device"
    )

    # Not recorded anywhere in the database
    device["failedAttempts"] = None
    device["geographicVariation"] = None
    device["unavailable"] = [
        "Failed login/transaction attempts are not recorded in the data",
        "Transaction location is not recorded in the data",
    ]

    # -----------------------------------------------------
    # LINKED CUSTOMERS (real customer_id)
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT
            customer_id,
            COUNT(*),
            SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END),
            AVG(amount),
            MAX(risk_score),
            MAX(timestamp)
        FROM transactions_clean
        WHERE device_id = ? AND customer_id IS NOT NULL
        GROUP BY customer_id
        ORDER BY 3 DESC, 2 DESC
        """,
        (device_id,)
    )

    customer_rows = cursor.fetchall()

    customer_ids = [r[0] for r in customer_rows]

    other_devices = {}

    if customer_ids:
        ph = ",".join("?" for _ in customer_ids)
        cursor.execute(
            f"""
            SELECT customer_id, COUNT(DISTINCT device_id)
            FROM transactions_clean
            WHERE customer_id IN ({ph}) AND device_id IS NOT NULL
            GROUP BY customer_id
            """,
            customer_ids
        )
        other_devices = {r[0]: max(int(r[1]) - 1, 0) for r in cursor.fetchall()}

    linked = []

    for cid, cnt, susp, avg_amt, max_score, last_seen in customer_rows:
        susp = int(susp or 0)
        linked.append({
            "id": cid,
            "transactions": int(cnt),
            "suspicious": susp,
            "avgAmount": round(float(avg_amt or 0), 2),
            "maxRiskScore": round(float(max_score or 0), 1),
            "riskLevel": _customer_level(float(max_score or 0), susp),
            "lastSeen": last_seen,
            "otherDevices": other_devices.get(cid, 0),
        })

    device["customers"] = customer_ids
    device["customerCount"] = len(customer_ids)
    device["linkedCustomers"] = linked

    # -----------------------------------------------------
    # DEVICE SHARING
    # -----------------------------------------------------

    suspicious_customers = [c["id"] for c in linked if c["suspicious"] > 0]
    distinct = len(customer_ids)

    if distinct >= 5:
        level = "Critical"
    elif distinct >= 3:
        level = "High"
    elif distinct == 2:
        level = "Medium"
    else:
        level = "None"

    registry_accounts = device["accounts"] if row else None

    device["sharing"] = {
        "distinctCustomers": distinct,
        "registryLinkedAccounts": registry_accounts,
        "registryMismatch": (
            registry_accounts is not None and registry_accounts != distinct
        ),
        "suspiciousCustomers": len(suspicious_customers),
        "level": level,
    }

    # -----------------------------------------------------
    # RELATED DEVICES (other devices used by the same customers)
    # -----------------------------------------------------

    related = []

    if customer_ids:
        ph = ",".join("?" for _ in customer_ids)
        cursor.execute(
            f"""
            SELECT t.device_id,
                   COUNT(DISTINCT t.customer_id),
                   d.risk
            FROM transactions_clean t
            LEFT JOIN devices d ON d.device_id = t.device_id
            WHERE t.customer_id IN ({ph})
              AND t.device_id IS NOT NULL
              AND t.device_id != ?
            GROUP BY t.device_id
            ORDER BY 2 DESC
            LIMIT 8
            """,
            customer_ids + [device_id]
        )
        related = [
            {"id": r[0], "sharedCustomers": int(r[1]), "risk": r[2]}
            for r in cursor.fetchall()
        ]

    device["relatedDevices"] = related

    # -----------------------------------------------------
    # SIGNALS (rule-based, derived from the numbers above)
    # -----------------------------------------------------

    signals = []

    if distinct >= 5:
        signals.append({
            "severity": "critical",
            "text": f"Device used by {distinct} different customers",
        })
    elif distinct >= 3:
        signals.append({
            "severity": "warning",
            "text": f"Device used by {distinct} different customers",
        })

    if len(suspicious_customers) >= 2:
        signals.append({
            "severity": "critical",
            "text": f"{len(suspicious_customers)} linked customers have HIGH/CRITICAL transactions",
        })
    elif len(suspicious_customers) == 1:
        signals.append({
            "severity": "warning",
            "text": "A linked customer has HIGH/CRITICAL transactions",
        })

    if txn_count and device["suspiciousTransactions"]:
        share = device["suspiciousTransactions"] / txn_count * 100
        signals.append({
            "severity": "warning" if share < 50 else "critical",
            "text": (
                f"{device['suspiciousTransactions']} of {txn_count} transactions "
                f"({share:.0f}%) are HIGH/CRITICAL"
            ),
        })

    if device["sharing"]["registryMismatch"]:
        signals.append({
            "severity": "info",
            "text": (
                f"Registry lists {registry_accounts} linked account(s) but only "
                f"{distinct} distinct customer(s) appear in transactions"
            ),
        })

    device["signals"] = signals

    conn.close()

    return device


def get_device_transactions(device_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            customer_id,
            amount,
            channel,
            risk_score,
            risk_level,
            timestamp,
            device_id
        FROM transactions_clean
        WHERE device_id = ?
        ORDER BY timestamp DESC
        LIMIT 100
        """,
        (device_id,)
    )

    rows = cursor.fetchall()

    conn.close()

    transactions = []

    for row in rows:
        transactions.append(
            {
                "id": f"TXN-{row[0]}",
                "customer": row[1] or "Unknown",
                "type": row[3] or "Unknown",
                "amount": float(row[2] or 0),
                "score": round(float(row[4] or 0)),
                "level": (row[5] or "Low").capitalize(),
                "time": row[6] or "",
                "device": row[7]
            }
        )

    return transactions