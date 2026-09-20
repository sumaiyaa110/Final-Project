from services.database import get_connection



def get_investigation_queue():


    conn = get_connection()

    cursor = conn.cursor()



    cursor.execute(

        """

        SELECT

            id,

            amount,

            channel,

            risk_score,

            risk_level,

            customer_id,

            timestamp


        FROM transactions


        WHERE risk_level IN ('HIGH','CRITICAL')


        ORDER BY id DESC


        LIMIT 10


        """

    )



    rows = cursor.fetchall()



    conn.close()



    queue = []



    for row in rows:


        queue.append({

            "id":
                f"TXN-{row[0]}",


            "amount":
                f"৳{float(row[1]):,.0f}",


            "channel":
                row[2],


            "risk_score":
                row[3],


            "risk_level":
                row[4].capitalize(),


            "customer":
                row[5],


            "time":
                row[6]

        })



    return queue