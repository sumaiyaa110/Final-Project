from services.database import get_connection



def get_transactions():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        """

        SELECT *

        FROM transactions

        ORDER BY id DESC

        LIMIT 500

        """
    )


    rows = cursor.fetchall()


    transactions = []



    for row in rows:


        txn_id = row[0]


        timestamp = None
        amount = 0
        channel = "Unknown"
        risk_score = 0
        risk_level = "LOW"
        customer_id = None
        device_id = None



        # ==========================================
        # FIND VALUES BY TYPE
        # ==========================================


        for value in row:


            # timestamp
            if isinstance(value, str):

                if "T" in value and ":" in value:

                    timestamp = value



            # customer
            if isinstance(value, str):

                if value.startswith("CUST"):

                    customer_id = value



            # device
            if isinstance(value, str):

                if value.startswith("DEV"):

                    device_id = value



            # risk level
            if isinstance(value, str):

                if value.upper() in [
                    "LOW",
                    "MEDIUM",
                    "HIGH",
                    "CRITICAL"
                ]:

                    risk_level = value.upper()



            # numeric values
            if isinstance(value,(int,float)):


                if value > 0 and amount == 0:

                    amount = value




        # ==========================================
        # FIND RISK SCORE
        # ==========================================


        for value in row:


            if isinstance(value,(int,float)):


                if 0 <= value <= 100:

                    risk_score = value





        if risk_level in [
            "HIGH",
            "CRITICAL"
        ]:

            status = "Investigate"


        elif risk_level == "MEDIUM":

            status = "Review"


        else:

            status = "Normal"





        transactions.append({

            "id":
                f"TXN-{txn_id}",


            "type":
                channel,


            "amount":
                f"৳{float(amount):,.0f}",


            "score":
                round(float(risk_score),0),


            "level":
                risk_level.capitalize(),


            "status":
                status,


            "customer":
                customer_id
                if customer_id
                else f"CUST-{txn_id}",


            "device":
                device_id
                if device_id
                else f"DEV-{txn_id}",


            "time":
                timestamp
                if timestamp
                else "Unknown"

        })



    conn.close()


    return transactions