from services.database import get_connection




def get_transactions():


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

        device_id


    FROM transactions


    ORDER BY id DESC


    LIMIT 500


    """

    )




    rows = cursor.fetchall()



    transactions = []





    for row in rows:



        risk = row[5]



        if risk.upper() == "HIGH":


            status = "Investigate"



        elif risk.upper() == "MEDIUM":


            status = "Review"



        elif risk.upper() == "CRITICAL":


            status = "Investigate"



        else:


            status = "Normal"







        transactions.append({



            "id":

            f"TXN-{row[0]}",





            "type":

            row[3],





            "amount":

            f"৳{float(row[2]):,.0f}",





            "score":

            round(float(row[4]),0),





            "level":

            risk.capitalize(),





            "status":

            status,





            "customer":

            row[6]

            if row[6]

            else f"CUST-{row[0]}",





            "device":

            row[7]

            if row[7]

            else f"DEVICE-{row[0]}",





            "time":

            row[1]



        })





    conn.close()



    return transactions