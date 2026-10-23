from services.database import get_connection


TOP_ENTITIES = 20
MAX_GRAPH_EDGES = 80
SUSPICIOUS_DEGREE = 20


# Degree of every node (edges where it is source + edges where it is target)
DEGREE_SQL = """
    SELECT
        node_id,
        SUM(outgoing) AS outgoing,
        SUM(incoming) AS incoming,
        SUM(outgoing) + SUM(incoming) AS degree
    FROM (
        SELECT source AS node_id, COUNT(*) AS outgoing, 0 AS incoming
        FROM network_edges
        GROUP BY source

        UNION ALL

        SELECT target AS node_id, 0 AS outgoing, COUNT(*) AS incoming
        FROM network_edges
        GROUP BY target
    )
    GROUP BY node_id
"""


def node_type(node_id):

    if node_id.startswith("DEV"):
        return "Device"

    if node_id.startswith("AGT"):
        return "Agent"

    return "Customer"


def degree_risk(degree):

    if degree >= 100:
        return "Critical"

    if degree >= 50:
        return "High"

    if degree >= SUSPICIOUS_DEGREE:
        return "Medium"

    return "Low"


def get_network_data():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM network_edges")

    connections = cursor.fetchone()[0]

    if connections == 0:

        conn.close()

        return {
            "summary": {},
            "nodes": [],
            "edges": [],
            "suspicious_network_list": []
        }


    # ==========================================
    # SUMMARY
    # ==========================================

    cursor.execute(
        f"""
        SELECT
            COUNT(*),
            SUM(CASE WHEN node_id LIKE 'DEV%' AND degree > 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN degree >= ? THEN 1 ELSE 0 END)
        FROM ({DEGREE_SQL})
        """,
        (SUSPICIOUS_DEGREE,)
    )

    total_entities, shared_devices, suspicious_count = cursor.fetchone()


    # ==========================================
    # TOP SUSPICIOUS ENTITIES
    # ==========================================

    cursor.execute(
        f"""
        SELECT node_id, degree
        FROM ({DEGREE_SQL})
        ORDER BY degree DESC
        LIMIT ?
        """,
        (TOP_ENTITIES,)
    )

    suspicious = cursor.fetchall()

    suspicious_ids = [str(row[0]) for row in suspicious]


    # ==========================================
    # GRAPH EDGES (around the top entities)
    # ==========================================

    placeholders = ",".join("?" for _ in suspicious_ids)

    cursor.execute(
        f"""
        SELECT source, target, amount, transaction_count
        FROM network_edges
        WHERE source IN ({placeholders})

        UNION ALL

        SELECT source, target, amount, transaction_count
        FROM network_edges
        WHERE target IN ({placeholders})
          AND source NOT IN ({placeholders})

        ORDER BY transaction_count DESC, amount DESC
        LIMIT ?
        """,
        suspicious_ids * 3 + [MAX_GRAPH_EDGES]
    )

    graph_edges = [
        {
            "source": str(source),
            "target": str(target),
            "amount": float(amount or 0),
            "transaction_count": int(transaction_count or 0)
        }
        for source, target, amount, transaction_count in cursor.fetchall()
    ]

    conn.close()


    # ==========================================
    # GRAPH NODES
    # ==========================================

    graph_node_ids = (
        {edge["source"] for edge in graph_edges}
        | {edge["target"] for edge in graph_edges}
    )

    graph_nodes = [
        {
            "id": node_id,
            "label": node_id,
            "type": node_type(node_id)
        }
        for node_id in graph_node_ids
    ]


    # ==========================================
    # SUSPICIOUS NETWORK TABLE
    # ==========================================

    suspicious_networks = []

    for index, (node_id, degree) in enumerate(suspicious[:10], start=1):

        degree = int(degree)

        risk = degree_risk(degree)

        if risk == "Critical":
            status = "Investigating"
        elif risk == "High":
            status = "Pending"
        else:
            status = "Reviewed"

        suspicious_networks.append({
            "id": f"NET-{index:03d}",
            "entity_id": str(node_id),
            "entities": degree + 1,
            "connections": degree,
            "risk": risk,
            "status": status
        })


    return {

        "summary": {
            "total_entities": int(total_entities or 0),
            "connections": int(connections),
            "shared_devices": int(shared_devices or 0),
            "suspicious_networks": int(suspicious_count or 0)
        },

        "nodes": graph_nodes,

        "edges": graph_edges,

        "suspicious_network_list": suspicious_networks

    }
