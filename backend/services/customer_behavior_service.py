from services.database import get_connection



def get_customer_behavior(customer_id):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
    """
    SELECT

        id,
        amount,
        risk_score,
        risk_level,
        timestamp

    FROM transactions

    ORDER BY id DESC

    LIMIT 10

    """
    )


    rows = cursor.fetchall()


    transactions=[]


    for row in reversed(rows):

        transactions.append({

            "id":
            f"TXN-{row[0]}",


            "amount":
            float(row[1]),


            "riskScore":
            float(row[2]),


            "riskLevel":
            row[3].capitalize(),


            "time":
            row[4]

        })


    conn.close()


    return transactions