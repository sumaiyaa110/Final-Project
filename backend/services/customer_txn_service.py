from services.database import get_connection



def get_customer_transactions(customer_id: str):


    conn = get_connection()

    cursor = conn.cursor()



    # Remove CUST- prefix
    real_id = customer_id.replace(
        "CUST-",
        ""
    )



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


        WHERE id LIKE ?


        ORDER BY id DESC


        LIMIT 20


        """,

        (
            f"%{real_id}",
        )

    )



    rows = cursor.fetchall()



    conn.close()



    transactions = []



    for row in rows:


        risk_level = row[5]



        if risk_level == "HIGH":

            status = "Investigate"


        elif risk_level == "MEDIUM":

            status = "Review"


        else:

            status = "Normal"




        transactions.append(

            {


                "id":
                    f"TXN-{row[0]}",



                "type":
                    row[3],



                "amount":
                    f"৳{float(row[2]):,.0f}",



                "risk":
                    round(
                        float(row[4]),
                        0
                    ),



                "status":
                    status,



                "time":
                    row[1],



                "fraud_probability":
                    float(row[6]),



                "anomaly_score":
                    float(row[7]),



                "new_device":
                    bool(row[8])



            }

        )



    return transactions