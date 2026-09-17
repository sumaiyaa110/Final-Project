from services.database import get_connection



def get_agents():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT
            agent_id,
            agent_type,
            active_cases,
            alerts,
            status,
            last_active

        FROM agents

        """
    )


    rows = cursor.fetchall()


    conn.close()



    agents = []


    for row in rows:


        agents.append({

            "id": row[0],

            "name": row[0],

            "email":
                f"{row[0].lower()}@anomalyx.com",

            "role": row[1],

            "activeCases":
                row[2],

            "alerts":
                row[3],

            "status":
                row[4],

            "lastActive":
                row[5]

        })



    return agents