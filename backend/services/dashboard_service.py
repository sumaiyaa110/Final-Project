from services.database import get_connection



def get_dashboard_summary():

    conn = get_connection()
    cursor = conn.cursor()


    # Total transactions from database
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        """
    )

    total_transactions = cursor.fetchone()[0]


    # Fraud / high risk alerts
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )

    fraud_alerts = cursor.fetchone()[0]


    # High risk entities
    cursor.execute(
        """
        SELECT COUNT(DISTINCT channel)
        FROM transactions
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )

    high_risk_entities = cursor.fetchone()[0]


    # Fraud percentage

    if total_transactions > 0:

        fraud_rate = round(
            (fraud_alerts / total_transactions) * 100,
            2
        )

    else:

        fraud_rate = 0



    conn.close()


    return {

        "total_transactions": total_transactions,

        "fraud_alerts": fraud_alerts,

        "high_risk_entities": high_risk_entities,

        "fraud_rate": fraud_rate

    }




def get_high_risk_transactions():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT
            rowid,
            timestamp,
            amount,
            channel,
            risk_score,
            risk_level

        FROM transactions

        WHERE risk_level IN ('HIGH','CRITICAL')

        ORDER BY rowid DESC

        LIMIT 10

        """
    )


    rows = cursor.fetchall()


    results = []


    for row in rows:

        results.append({

            "id":
                f"TXN-{row[0]}",

            "customer":
                "CUSTOMER",

            "amount":
                row[2],

            "channel":
                row[3],

            "risk_score":
                row[4],

            "status":
                row[5],

            "time":
                row[1]

        })


    conn.close()


    return results