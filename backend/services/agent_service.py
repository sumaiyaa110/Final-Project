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
            name,
            email,
            location,
            agent_type,
            active_cases,
            alerts,
            status,
            last_active,
            rating
        FROM agents
        ORDER BY alerts DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    agents = []

    for row in rows:

        agent_id = row[0]

        agents.append({

            "id": agent_id,

            "name": row[1] or agent_id,

            "email": row[2] or f"{agent_id.lower()}@anomalyx.com",

            "location": row[3],

            "role": row[4],

            "activeCases": int(row[5] or 0),

            "alerts": int(row[6] or 0),

            "status": row[7],

            "lastActive": row[8],

            "rating": row[9]

        })

    return agents


# =====================================================
# ASSIGN FRAUD CASE TO AGENT
# =====================================================

def assign_fraud_case():

    conn = get_connection()
    cursor = conn.cursor()

    # Pick a random active agent
    cursor.execute(
        """
        SELECT
            agent_id,
            active_cases,
            alerts
        FROM agents
        WHERE status = 'Active'
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
                active_cases = ?,
                alerts = ?,
                last_active = ?
            WHERE agent_id = ?
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
