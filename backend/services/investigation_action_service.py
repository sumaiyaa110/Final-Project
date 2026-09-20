from services.database import get_connection
from datetime import datetime



def update_investigation_status(transaction_id, status):


    conn = get_connection()

    cursor = conn.cursor()



    cursor.execute(

        """

        INSERT INTO investigation_actions

        (
            transaction_id,
            status,
            updated_time
        )

        VALUES(?,?,?)

        """,

        (

            transaction_id,

            status,

            datetime.now().isoformat()

        )

    )



    conn.commit()

    conn.close()



    return {


        "message":
            "Status updated successfully",


        "transaction_id":
            transaction_id,


        "status":
            status

    }