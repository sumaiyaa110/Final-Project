import sqlite3


DATABASE_PATH = "database/anomalyx.db"


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE_PATH,
        check_same_thread=False
    )

    return connection


# =====================================================
# CREATE TABLES
# =====================================================

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

            risk_level TEXT,

            alert_status TEXT DEFAULT 'Pending'

        )
        """
    )


    # ==========================================
    # DATABASE MIGRATION
    # Add alert_status to an existing database
    # ==========================================

    cursor.execute(
        "PRAGMA table_info(transactions)"
    )

    columns = [
        row[1]
        for row in cursor.fetchall()
    ]


    if "alert_status" not in columns:

        print(
            "Adding alert_status column..."
        )

        cursor.execute(
            """
            ALTER TABLE transactions

            ADD COLUMN alert_status TEXT

            DEFAULT 'Pending'
            """
        )

        print(
            "alert_status column added successfully"
        )


    # ==========================================
    # UPDATE OLD TRANSACTIONS
    # ==========================================
    # Any old transaction that has no alert
    # status will be treated as Pending.

    cursor.execute(
        """
        UPDATE transactions

        SET alert_status = 'Pending'

        WHERE alert_status IS NULL
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


    # ==========================================
    # COMMIT CHANGES
    # ==========================================

    conn.commit()

    conn.close()


    print(
        "Database tables created successfully"
    )