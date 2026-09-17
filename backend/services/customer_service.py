from services.database import get_connection



def get_customers():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
    """
    SELECT

        id,
        risk_level,
        COUNT(*) as transactions,
        MAX(timestamp) as last_activity

    FROM transactions

    GROUP BY id

    ORDER BY transactions DESC

    LIMIT 500

    """
    )


    rows = cursor.fetchall()


    customers=[]


    for row in rows:


        risk = row[1]


        if risk == "HIGH":

            risk_level="High"

        elif risk=="MEDIUM":

            risk_level="Medium"

        else:

            risk_level="Low"



        customers.append({

            "id":
            f"CUST-{row[0]}",


            "name":
            f"Customer {row[0]}",


            "risk":
            risk_level,


            "transactions":
            row[2],


            "lastActivity":
            row[3],


            "status":
            "Active",


            "devices":
            [
                f"DEVICE-{row[0]}"
            ]

        })


    conn.close()


    return customers