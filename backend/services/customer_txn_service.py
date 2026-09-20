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

            new_device_flag,

            customer_id


        FROM transactions


        WHERE customer_id = ?

        OR customer_id = ?


        ORDER BY id DESC


        LIMIT 20


        """,

        (

            customer_id,

            real_id

        )

    )



    rows = cursor.fetchall()



    conn.close()



    transactions = []



    for row in rows:


        risk_score = row[4]

        risk_level = row[5]



        if risk_level:

            risk_level = risk_level.upper()

        else:

            risk_level = "LOW"



        if risk_level in [
            "HIGH",
            "CRITICAL"
        ]:

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
                        float(risk_score or 0),
                        0
                    ),



                "status":

                    status,



                "time":

                    row[1],



                "fraud_probability":

                    float(row[6] or 0),



                "anomaly_score":

                    float(row[7] or 0),



                "new_device":

                    bool(row[8])

            }

        )



    return transactions