from datetime import datetime

from services.database import get_connection





# =====================================================
# GET ALL AGENTS FOR FRONTEND
# =====================================================

def get_agents():


    conn = get_connection()

    cursor = conn.cursor()



    cursor.execute(

    """

    SELECT

        agent_id,

        location,

        agent_type,

        active_cases,

        alerts,

        status,

        last_active


    FROM agents


    ORDER BY alerts DESC


    """

    )



    rows = cursor.fetchall()



    conn.close()



    agents = []



    for row in rows:


        agents.append(

        {


            "id": row[0],


            "name": row[0],


            "email": row[0] + "@anomalyx.com",


            "role": row[2],


            "activeCases": int(row[3]),


            "alerts": int(row[4]),


            "status": row[5],


            "lastActive": row[6]


        }

        )



    return agents







# =====================================================
# ASSIGN FRAUD CASE TO AGENT
# =====================================================


def assign_fraud_case():


    conn = get_connection()

    cursor = conn.cursor()





    # Select an active agent

    cursor.execute(

        """

        SELECT

            agent_id,

            active_cases,

            alerts


        FROM agents


        WHERE status='Active'


        ORDER BY RANDOM()


        LIMIT 1


        """

    )



    agent = cursor.fetchone()





    if agent:



        agent_id = agent[0]



        current_cases = agent[1]

        current_alerts = agent[2]





        cursor.execute(

        """

        UPDATE agents


        SET


            active_cases = ?,


            alerts = ?,


            last_active = ?



        WHERE agent_id = ?


        """,

        (

            current_cases + 1,


            current_alerts + 1,


            datetime.now().isoformat(),


            agent_id

        )

        )





    conn.commit()

    conn.close()







# =====================================================
# OPTIONAL: MANUAL AGENT ACTIVITY UPDATE
# =====================================================

# Keep this only if you want testing.
# Do NOT call this from simulator.


def update_agent_activity():


    conn = get_connection()

    cursor = conn.cursor()



    cursor.execute(

    """

    SELECT

        agent_id,

        active_cases,

        alerts


    FROM agents


    ORDER BY RANDOM()


    LIMIT 1


    """

    )



    agent = cursor.fetchone()



    if agent:


        cursor.execute(

        """

        UPDATE agents


        SET


        active_cases=?,


        alerts=?,


        last_active=?



        WHERE agent_id=?


        """,

        (

            agent[1] + 1,


            agent[2] + 1,


            datetime.now().isoformat(),


            agent[0]

        )

        )




    conn.commit()

    conn.close()