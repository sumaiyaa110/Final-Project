from services.database import get_connection


def create_agents():

    conn = get_connection()

    cursor = conn.cursor()


    agents = [

        (
            "AGT-001",
            "Senior Fraud Analyst",
            0,
            0,
            "Active",
            None
        ),

        (
            "AGT-002",
            "Fraud Analyst",
            0,
            0,
            "Active",
            None
        ),

        (
            "AGT-003",
            "Investigator",
            0,
            0,
            "Active",
            None
        ),

        (
            "AGT-004",
            "Fraud Analyst",
            0,
            0,
            "Away",
            None
        ),

        (
            "AGT-005",
            "Investigator",
            0,
            0,
            "Active",
            None
        )

    ]



    cursor.executemany(

    """
    INSERT OR IGNORE INTO agents

    (
        agent_id,
        agent_type,
        active_cases,
        alerts,
        status,
        last_active
    )

    VALUES(?,?,?,?,?,?)

    """,

    agents

    )



    conn.commit()

    conn.close()


    print(
        "Agents initialized"
    )