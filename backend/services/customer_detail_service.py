from services.database import get_connection



def get_customer_detail(customer_id):

    conn = get_connection()
    cursor = conn.cursor()


    # Extract numeric id
    real_id = customer_id.replace("CUST-", "")


    cursor.execute(
        """
        SELECT

            COUNT(*),
            SUM(amount),
            MAX(timestamp),
            AVG(risk_score),
            SUM(
                CASE 
                WHEN risk_level='HIGH'
                THEN 1
                ELSE 0
                END
            )

        FROM transactions

        WHERE id LIKE ?

        """,
        (f"%{real_id}",)
    )


    result = cursor.fetchone()



    if not result:

        return {
            "error":"Customer not found"
        }



    total_transactions = result[0] or 0

    total_amount = result[1] or 0

    last_activity = result[2]

    risk_score = round(result[3] or 0)

    fraud_alerts = result[4] or 0



    if risk_score >=80:
        risk="High"

    elif risk_score >=50:
        risk="Medium"

    else:
        risk="Low"



    return {

        "id":customer_id,

        "name":f"Customer {customer_id}",

        "phone":"+880 **********",

        "risk":risk,

        "riskScore":risk_score,

        "status":"Active",

        "totalTransactions":total_transactions,

        "totalAmount":total_amount,

        "fraudAlerts":fraud_alerts,

        "lastActivity":last_activity,

        "customerSince":"2026"

    }