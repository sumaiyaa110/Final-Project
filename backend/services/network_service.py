import pandas as pd

from services.database import get_connection




def get_network_data():


    conn = get_connection()

    cursor = conn.cursor()



    # ==========================================
    # LOAD NETWORK EDGES FROM SQLITE
    # ==========================================

    cursor.execute(

    """

    SELECT

        source,

        target,

        amount,

        transaction_count


    FROM network_edges

    """

    )


    rows = cursor.fetchall()


    conn.close()



    if len(rows) == 0:

        return {

            "summary": {},

            "nodes": [],

            "edges": [],

            "suspicious_network_list": []

        }





    edges_df = pd.DataFrame(

        rows,

        columns=[

            "source",

            "target",

            "amount",

            "transaction_count"

        ]

    )






    # ==========================================
    # BASIC SUMMARY
    # ==========================================


    connections = len(edges_df)



    all_nodes = set(

        edges_df["source"].astype(str)

    ) | set(

        edges_df["target"].astype(str)

    )



    total_entities = len(all_nodes)







    # ==========================================
    # DEGREE CALCULATION
    # ==========================================


    source_counts = edges_df["source"].value_counts()

    target_counts = edges_df["target"].value_counts()



    degree_data = []



    for node_id in all_nodes:


        outgoing = int(

            source_counts.get(node_id,0)

        )


        incoming = int(

            target_counts.get(node_id,0)

        )


        degree_data.append(

        {

            "node_id":node_id,

            "degree":outgoing+incoming,

            "incoming":incoming,

            "outgoing":outgoing

        }

        )




    degree_df = pd.DataFrame(degree_data)







    # ==========================================
    # SHARED DEVICES
    # ==========================================

    device_nodes = degree_df[

        degree_df["node_id"].str.startswith("DEV")

    ]



    shared_devices = int(

        (device_nodes["degree"] > 1).sum()

    )







    # ==========================================
    # TOP SUSPICIOUS ENTITIES
    # ==========================================


    suspicious = degree_df.sort_values(

        "degree",

        ascending=False

    ).head(20)





    suspicious_ids = set(

        suspicious["node_id"]

    )






    # Filter graph edges

    graph_edges = edges_df[

        edges_df["source"].isin(suspicious_ids)

        |

        edges_df["target"].isin(suspicious_ids)

    ]





    graph_edges = graph_edges.sort_values(

        [

            "transaction_count",

            "amount"

        ],

        ascending=False

    ).head(80)







    # ==========================================
    # GRAPH NODES
    # ==========================================


    graph_node_ids = set(

        graph_edges["source"]

    ) | set(

        graph_edges["target"]

    )



    graph_nodes = []



    for node_id in graph_node_ids:


        node_type = (

            "Device"

            if str(node_id).startswith("DEV")

            else "Customer"

        )


        graph_nodes.append(

        {

            "id":str(node_id),

            "label":str(node_id),

            "type":node_type

        }

        )







    # ==========================================
    # GRAPH EDGES
    # ==========================================


    graph_edge_list = []



    for _, row in graph_edges.iterrows():


        graph_edge_list.append(

        {

            "source":str(row["source"]),

            "target":str(row["target"]),

            "amount":float(row["amount"]),

            "transaction_count":int(

                row["transaction_count"]

            )

        }

        )







    # ==========================================
    # SUSPICIOUS NETWORK TABLE
    # ==========================================


    suspicious_networks = []



    for index, (_,row) in enumerate(

        suspicious.head(10).iterrows(),

        start=1

    ):


        degree = int(row["degree"])



        if degree >= 100:

            risk="Critical"


        elif degree >=50:

            risk="High"


        elif degree>=20:

            risk="Medium"


        else:

            risk="Low"





        status = (

            "Investigating"

            if risk=="Critical"

            else

            "Pending"

            if risk=="High"

            else

            "Reviewed"

        )




        suspicious_networks.append(

        {

            "id":f"NET-{index:03d}",

            "entity_id":str(row["node_id"]),

            "entities":degree+1,

            "connections":degree,

            "risk":risk,

            "status":status

        }

        )







    suspicious_count = int(

        len(

            degree_df[

                degree_df["degree"]>=20

            ]

        )

    )







    return {


        "summary":{


            "total_entities":total_entities,


            "connections":connections,


            "shared_devices":shared_devices,


            "suspicious_networks":suspicious_count


        },


        "nodes":graph_nodes,


        "edges":graph_edge_list,


        "suspicious_network_list":suspicious_networks


    }