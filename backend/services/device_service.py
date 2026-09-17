from services.database import get_connection



def get_devices():


    conn = get_connection()

    cursor = conn.cursor()



    cursor.execute(

    """

    SELECT

        device_id,
        os_type,
        model,
        risk,
        linked_accounts,
        transaction_count,
        last_activity,
        status


    FROM devices


    ORDER BY

    CASE risk

        WHEN 'Critical' THEN 1

        WHEN 'High' THEN 2

        WHEN 'Medium' THEN 3

        ELSE 4

    END,

    transaction_count DESC


    LIMIT 1000


    """

    )



    rows = cursor.fetchall()



    conn.close()



    devices=[]



    for row in rows:


        devices.append(

        {

            "id": row[0],

            "type": row[1],

            "model": row[2],

            "risk": row[3],

            "accounts": int(row[4]),

            "transactions": int(row[5]),

            "lastActivity": row[6],

            "status": row[7]

        }

        )


    return devices