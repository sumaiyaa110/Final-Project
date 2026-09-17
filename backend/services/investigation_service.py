from services.database import get_connection





def get_customer_investigation(customer_id: str):


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

            fraud_probability,

            anomaly_score,

            device_id



        FROM transactions



        WHERE customer_id = ?



        ORDER BY id DESC



        LIMIT 50


        """,

        (

            customer_id,

        )

    )





    rows = cursor.fetchall()



    transactions = []





    for row in rows:



        transactions.append({


            "transaction_id":

                f"TXN-{row[0]}",



            "time":

                row[1],



            "amount":

                row[2],



            "channel":

                row[3],



            "risk_score":

                row[4],



            "risk_level":

                row[5],



            "fraud_probability":

                row[6],



            "anomaly_score":

                row[7],



            "device_id":

                row[8]

        })





    conn.close()





    # Calculate investigation priority


    highest_risk = 0



    if transactions:


        highest_risk = max(

            float(tx["risk_score"])

            for tx in transactions

        )






    if highest_risk >= 80:

        priority = "Critical"


    elif highest_risk >= 60:

        priority = "High"


    elif highest_risk >= 30:

        priority = "Medium"


    else:

        priority = "Low"








    return {



        "customer_id":

            customer_id,



        "total_cases":

            len(transactions),



        "priority":

            priority,



        "highest_risk":

            highest_risk,



        "transactions":

            transactions



    }