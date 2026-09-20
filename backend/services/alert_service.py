from services.database import get_connection
from datetime import datetime


# =====================================================
# GET ACTIVE FRAUD ALERTS
# =====================================================

def get_fraud_alerts():

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

            alert_status

        FROM transactions

        WHERE risk_level IN ('HIGH', 'CRITICAL')

        AND (
            alert_status IS NULL
            OR alert_status != 'Resolved'
        )

        ORDER BY id DESC

        LIMIT 100

        """
    )


    rows = cursor.fetchall()


    alerts = []


    for row in rows:

        txn_id = row[0]

        risk = row[5]

        customer_id = row[6]

        alert_status = row[7] or "Pending"


        # =============================================
        # ALERT TYPE
        # =============================================

        if risk.lower() == "critical":

            alert_type = "Critical Transaction"

            icon = "⚠"


        elif risk.lower() == "high":

            alert_type = "High Risk Transaction"

            icon = "▲"


        else:

            alert_type = "Suspicious Activity"

            icon = "◉"


        # =============================================
        # CUSTOMER ID
        # =============================================

        if customer_id:

            customer = customer_id

        else:

            customer = "CUSTOMER-" + str(txn_id)


        # =============================================
        # ALERT OBJECT
        # =============================================

        alerts.append({

            "id":
                f"ALT-{txn_id}",

            "type":
                alert_type,

            "description":
                f"{row[2]} amount transaction detected",

            "icon":
                icon,

            "risk":
                risk.capitalize(),

            "transaction":
                f"TXN-{txn_id}",

            "customer":
                customer,

            "detected":
                row[1],

            "status":
                alert_status

        })


    conn.close()


    return alerts


# =====================================================
# GET ALERT SUMMARY
# =====================================================

def get_alert_summary():

    conn = get_connection()
    cursor = conn.cursor()


    # =============================================
    # TOTAL ACTIVE FRAUD ALERTS
    # =============================================

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE risk_level IN ('HIGH', 'CRITICAL')

        AND (
            alert_status IS NULL
            OR alert_status != 'Resolved'
        )

        """
    )


    total = cursor.fetchone()[0]


    # =============================================
    # HIGH RISK ACTIVE ALERTS
    # =============================================

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE risk_level = 'HIGH'

        AND (
            alert_status IS NULL
            OR alert_status != 'Resolved'
        )

        """
    )


    high = cursor.fetchone()[0]


    # =============================================
    # CRITICAL ACTIVE ALERTS
    # =============================================

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE risk_level = 'CRITICAL'

        AND (
            alert_status IS NULL
            OR alert_status != 'Resolved'
        )

        """
    )


    critical = cursor.fetchone()[0]


    # =============================================
    # PENDING ALERTS
    # =============================================

    cursor.execute(
        """
        SELECT COUNT(*)

        FROM transactions

        WHERE risk_level IN ('HIGH', 'CRITICAL')

        AND (
            alert_status IS NULL
            OR alert_status != 'Resolved'
        )

        """
    )


    pending = cursor.fetchone()[0]


    conn.close()


    return {

        "total_alerts":
            total,

        "critical":
            critical,

        "high_risk":
            high,

        "pending":
            pending

    }


# =====================================================
# RESOLVE FRAUD ALERT
# =====================================================

def resolve_alert(alert_id: str):

    conn = get_connection()
    cursor = conn.cursor()


    # =============================================
    # CONVERT ALERT ID
    # ALT-123 → 123
    # =============================================

    if alert_id.startswith("ALT-"):

        transaction_id = alert_id.replace(
            "ALT-",
            "",
            1
        )

    else:

        transaction_id = alert_id


    # =============================================
    # CHECK ALERT
    # =============================================

    cursor.execute(
        """
        SELECT

            id,

            risk_level,

            alert_status

        FROM transactions

        WHERE id = ?

        AND risk_level IN ('HIGH', 'CRITICAL')

        """,

        (transaction_id,)

    )


    row = cursor.fetchone()


    if not row:

        conn.close()


        return {

            "success":
                False,

            "message":
                "Alert not found"

        }


    # =============================================
    # ALREADY RESOLVED
    # =============================================

    if row[2] == "Resolved":

        conn.close()


        return {

            "success":
                False,

            "message":
                "Alert is already resolved"

        }


    # =============================================
    # MARK ALERT AS RESOLVED
    # =============================================

    cursor.execute(
        """
        UPDATE transactions

        SET alert_status = 'Resolved'

        WHERE id = ?

        """,

        (transaction_id,)

    )


    conn.commit()

    conn.close()


    # =============================================
    # RESPONSE
    # =============================================

    return {

        "success":
            True,

        "alert_id":
            f"ALT-{transaction_id}",

        "transaction_id":
            f"TXN-{transaction_id}",

        "status":
            "Resolved",

        "message":
            "Alert resolved successfully"

    }