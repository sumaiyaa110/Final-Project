import sqlite3


DATABASE_PATH = "database/anomalyx.db"




def get_connection():

    connection = sqlite3.connect(

        DATABASE_PATH,

        check_same_thread=False

    )

    return connection







def create_tables():


    conn = get_connection()

    cursor = conn.cursor()



    # ==========================================
    # TRANSACTIONS TABLE
    # ==========================================


    cursor.execute(

    """

    CREATE TABLE IF NOT EXISTS transactions(

        id INTEGER PRIMARY KEY AUTOINCREMENT,


        customer_id TEXT,


        device_id TEXT,


        timestamp TEXT,


        amount REAL,


        channel TEXT,


        txn_hour INTEGER,


        new_device_flag INTEGER,


        fraud_probability REAL,


        anomaly_score REAL,


        risk_score REAL,


        risk_level TEXT

    )

    """

    )







    # ==========================================
    # DEVICES TABLE
    # ==========================================


    cursor.execute(

    """

    CREATE TABLE IF NOT EXISTS devices(

        device_id TEXT PRIMARY KEY,


        os_type TEXT,


        model TEXT,


        risk TEXT,


        linked_accounts INTEGER,


        transaction_count INTEGER,


        last_activity TEXT,


        status TEXT

    )

    """

    )








    # ==========================================
    # NETWORK EDGES TABLE
    # ==========================================


    cursor.execute(

    """

    CREATE TABLE IF NOT EXISTS network_edges(

        id INTEGER PRIMARY KEY AUTOINCREMENT,


        source TEXT,


        target TEXT,


        amount REAL,


        transaction_count INTEGER

    )

    """

    )








    # ==========================================
    # AGENTS TABLE
    # ==========================================


    cursor.execute(

    """

    CREATE TABLE IF NOT EXISTS agents(

        agent_id TEXT PRIMARY KEY,


        agent_type TEXT,


        active_cases INTEGER DEFAULT 0,


        alerts INTEGER DEFAULT 0,


        status TEXT,


        last_active TEXT

    )

    """

    )







    conn.commit()

    conn.close()



    print(
        "Database tables created successfully"
    )