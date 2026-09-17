from services.database import get_connection



def get_transaction_detail(transaction_id):

    conn = get_connection()

    cursor = conn.cursor()


    real_id = transaction_id.replace("TXN-", "")


    cursor.execute(
        """
        SELECT

            id,
            timestamp,
            amount,
            channel,
            risk_score,
            risk_level,
            fraud_probability,
            anomaly_score,
            new_device_flag

        FROM transactions

        WHERE id=?

        """,
        (real_id,)
    )


    row = cursor.fetchone()


    conn.close()


    if not row:
        return {
            "error":"Transaction not found"
        }



    risk = row[5]


    if risk=="HIGH":
        status="Investigate"

    elif risk=="MEDIUM":
        status="Review"

    else:
        status="Normal"



    return {


        "id":
            f"TXN-{row[0]}",


        "type":
            row[3],


        "amount":
            f"৳{float(row[2]):,.0f}",


        "score":
            float(row[4]),


        "level":
            risk.capitalize(),


        "status":
            status,


        "customer":
            f"CUST-{row[0]}",


        "device":
            f"DEV-{row[0]}",


        "time":
            row[1],


        "fraud_probability":
            row[6],


        "anomaly_score":
            row[7],


        "new_device":
            row[8]


    }