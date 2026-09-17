import pandas as pd
from pathlib import Path

from services.database import get_connection



BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"





def initialize_devices():


    file_path = DATA_DIR / "devices_v4.csv"


    df = pd.read_csv(file_path)



    conn = get_connection()

    cursor = conn.cursor()



    count = 0



    for _, row in df.iterrows():


        score = row["device_risk_score"]



        if score >= 0.8:

            risk = "Critical"


        elif score >= 0.5:

            risk = "High"


        elif score >= 0.3:

            risk = "Medium"


        else:

            risk = "Low"




        cursor.execute(

        """

        INSERT OR REPLACE INTO devices

        (

            device_id,

            os_type,

            model,

            risk,

            linked_accounts,

            transaction_count,

            last_activity,

            status

        )


        VALUES (?,?,?,?,?,?,?,?)

        """,

        (

            str(row["device_id"]),

            str(row["os_type"]),

            "Mobile Device",

            risk,

            int(row["linked_account_count"]),

            int(row["sim_change_count"]),

            str(row["first_seen_date"]),

            "Active" if row["is_current"] else "Inactive"

        )


        )



        count += 1





    conn.commit()

    conn.close()



    print(

        f"Devices imported: {count}"

    )









def initialize_network():



    file_path = DATA_DIR / "edges.csv"



    df = pd.read_csv(file_path)



    conn = get_connection()

    cursor = conn.cursor()



    count = 0



    for _, row in df.iterrows():



        cursor.execute(

        """

        INSERT INTO network_edges

        (

            source,

            target,

            amount,

            transaction_count

        )


        VALUES (?,?,?,?)

        """,

        (

            str(row["source"]),

            str(row["target"]),

            float(row["amount"]),

            int(row["transaction_count"])

        )



        )



        count += 1





    conn.commit()

    conn.close()



    print(

        f"Network edges imported: {count}"

    )









def initialize_database():


    initialize_devices()

    initialize_network()



    print(

        "Database initialization completed"

    )





if __name__ == "__main__":


    initialize_database()