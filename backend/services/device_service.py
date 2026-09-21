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

def get_device_detail(device_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    # -----------------------------------------------------
    # DEVICE INFORMATION
    # -----------------------------------------------------

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

        WHERE device_id = ?

        LIMIT 1
        """,
        (device_id,)
    )

    row = cursor.fetchone()

    # Device does not exist
    if not row:

        conn.close()

        return None


    # -----------------------------------------------------
    # BASIC DEVICE DATA
    # -----------------------------------------------------

    device = {

        "id": row[0],

        "type": row[1],

        "model": row[2],

        "risk": row[3],

        "accounts": int(row[4] or 0),

        "transactions": int(row[5] or 0),

        "lastActivity": row[6],

        "status": row[7]

    }


    # -----------------------------------------------------
    # ACTUAL TRANSACTION COUNT
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE device_id = ?
        """,
        (device_id,)
    )

    transaction_count = cursor.fetchone()[0]

    device["actualTransactions"] = int(
        transaction_count or 0
    )


    # -----------------------------------------------------
    # TOTAL TRANSACTION AMOUNT
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT COALESCE(
            SUM(amount),
            0
        )

        FROM transactions

        WHERE device_id = ?
        """,
        (device_id,)
    )

    total_amount = cursor.fetchone()[0]

    device["totalAmount"] = float(
        total_amount or 0
    )


    # -----------------------------------------------------
    # HIGH RISK TRANSACTIONS
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE device_id = ?

        AND risk_level IN (
            'HIGH',
            'CRITICAL'
        )
        """,
        (device_id,)
    )

    high_risk_count = cursor.fetchone()[0]

    device["highRiskTransactions"] = int(
        high_risk_count or 0
    )


    # -----------------------------------------------------
    # CUSTOMERS LINKED TO DEVICE
    # -----------------------------------------------------

    cursor.execute(
        """
        SELECT DISTINCT customer_id

        FROM transactions

        WHERE device_id = ?

        AND customer_id IS NOT NULL
        """,
        (device_id,)
    )

    customer_rows = cursor.fetchall()

    customers = [
        row[0]
        for row in customer_rows
    ]

    device["customers"] = customers

    device["customerCount"] = len(
        customers
    )


    # -----------------------------------------------------
    # CLOSE DATABASE
    # -----------------------------------------------------

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
        FROM transactions
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
                "level": row[5] or "Low",
                "time": row[6] or "",
                "device": row[7]
            }
        )

    return transactions