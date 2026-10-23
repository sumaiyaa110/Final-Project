import os
import shutil
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

# The committed seed database is copied to the working database on first
# start, so the simulator's writes never show up as changes in git.
SEED_DATABASE_PATH = BASE_DIR / "database" / "anomalyx_seed.db"

# Relative paths are resolved against the backend folder
DATABASE_PATH = BASE_DIR / os.getenv(
    "ANOMALYX_DB_PATH",
    "database/anomalyx.db"
)


# =====================================================
# DATABASE CONNECTION
# =====================================================

def ensure_database():

    if DATABASE_PATH.exists():
        return

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    if SEED_DATABASE_PATH.exists():

        shutil.copyfile(SEED_DATABASE_PATH, DATABASE_PATH)

        print("Working database created from seed")


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

    ensure_database()

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


    # Model input features (JSON) for transactions scored by the
    # simulator, used to compute TreeSHAP explanations later.
    if "features" not in columns:

        cursor.execute(
            """
            ALTER TABLE transactions

            ADD COLUMN features TEXT
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


    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_network_edges_source "
        "ON network_edges(source)"
    )

    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_network_edges_target "
        "ON network_edges(target)"
    )


    # ==========================================
    # AGENTS TABLE
    # ==========================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS agents(

            agent_id TEXT PRIMARY KEY,

            name TEXT,

            email TEXT,

            location TEXT DEFAULT 'Dhaka HQ',

            agent_type TEXT,

            active_cases INTEGER DEFAULT 0,

            alerts INTEGER DEFAULT 0,

            status TEXT DEFAULT 'Active',

            last_active TEXT,

            rating REAL DEFAULT 4.8

        )
        """
    )

    # Agents table column migrations
    cursor.execute("PRAGMA table_info(agents)")
    agent_cols = [row[1] for row in cursor.fetchall()]
    for col, col_type, default_val in [
        ("name", "TEXT", None),
        ("email", "TEXT", None),
        ("location", "TEXT", "'Dhaka HQ'"),
        ("rating", "REAL", "4.8"),
    ]:
        if col not in agent_cols:
            default_sql = f" DEFAULT {default_val}" if default_val else ""
            cursor.execute(f"ALTER TABLE agents ADD COLUMN {col} {col_type}{default_sql}")

    # Older migrations filled every agent with the same placeholder
    # name/email; clear them so the API falls back to the agent ID.
    cursor.execute("UPDATE agents SET name = NULL WHERE name = 'Analyst'")
    cursor.execute(
        "UPDATE agents SET email = NULL WHERE email = 'analyst@anomalyx.com'"
    )

    # Seed default agents if none exist
    cursor.execute("SELECT COUNT(*) FROM agents")
    if cursor.fetchone()[0] == 0:
        seed_agents = [
            ("AGT-101", "Rahim Chowdhury", "rahim.c@anomalyx.com", "Dhaka HQ", "Senior Fraud Analyst", 4, 18, "Active", "2 min ago", 4.9),
            ("AGT-102", "Farhana Akter", "farhana.a@anomalyx.com", "Sylhet Branch", "Fraud Analyst", 2, 9, "Active", "5 min ago", 4.7),
            ("AGT-103", "Kazi Mahfuz", "kazi.m@anomalyx.com", "Chattogram Hub", "Lead Investigator", 6, 24, "Active", "Just now", 5.0),
            ("AGT-104", "Nazia Sultana", "nazia.s@anomalyx.com", "Dhaka HQ", "AML Specialist", 1, 5, "Away", "25 min ago", 4.6),
            ("AGT-105", "Shafiqul Alam", "shafiq.a@anomalyx.com", "Rajshahi Ops", "Junior Investigator", 3, 11, "Active", "12 min ago", 4.5),
        ]
        cursor.executemany(
            """
            INSERT OR REPLACE INTO agents (agent_id, name, email, location, agent_type, active_cases, alerts, status, last_active, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            seed_agents
        )

    # ==========================================
    # INVESTIGATION ACTIONS TABLE
    # ==========================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS investigation_actions(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            transaction_id TEXT,

            status TEXT,

            updated_time TEXT

        )
        """
    )

    # Investigation workflow columns (non-destructive migration)
    cursor.execute("PRAGMA table_info(investigation_actions)")
    inv_cols = [row[1] for row in cursor.fetchall()]
    for col in ("previous_status", "notes", "decision", "investigator_id"):
        if col not in inv_cols:
            cursor.execute(
                f"ALTER TABLE investigation_actions ADD COLUMN {col} TEXT"
            )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_inv_actions_txn "
        "ON investigation_actions(transaction_id)"
    )

    # ==========================================
    # CLEAN READ-ONLY VIEW OVER TRANSACTIONS
    # Some historical rows are column-shifted (timestamp column holds the
    # channel, etc.) and some have a timestamp stored in customer_id.
    # The view normalizes them without modifying any raw data.
    # ==========================================

    cursor.execute("DROP VIEW IF EXISTS transactions_clean")
    cursor.execute(
        """
        CREATE VIEW transactions_clean AS
        SELECT
            id,
            CASE WHEN timestamp LIKE '20%' THEN timestamp ELSE customer_id END AS timestamp,
            CASE WHEN timestamp LIKE '20%' THEN amount ELSE CAST(device_id AS REAL) END AS amount,
            CASE WHEN timestamp LIKE '20%' THEN channel ELSE timestamp END AS channel,
            CASE WHEN timestamp LIKE '20%' THEN txn_hour ELSE CAST(amount AS INTEGER) END AS txn_hour,
            CASE WHEN timestamp LIKE '20%' THEN new_device_flag ELSE CAST(channel AS INTEGER) END AS new_device_flag,
            CASE WHEN timestamp LIKE '20%' THEN fraud_probability ELSE CAST(txn_hour AS REAL) END AS fraud_probability,
            CASE WHEN timestamp LIKE '20%' THEN anomaly_score ELSE CAST(new_device_flag AS REAL) END AS anomaly_score,
            CASE WHEN timestamp LIKE '20%' THEN risk_score ELSE CAST(fraud_probability AS REAL) END AS risk_score,
            CASE WHEN timestamp LIKE '20%' THEN risk_level ELSE anomaly_score END AS risk_level,
            CASE
                WHEN timestamp LIKE '20%' THEN
                    CASE WHEN customer_id LIKE 'CUST-%' THEN customer_id ELSE NULL END
                ELSE
                    CASE WHEN risk_score LIKE 'CUST-%' THEN risk_score ELSE NULL END
            END AS customer_id,
            CASE
                WHEN timestamp LIKE '20%' THEN
                    CASE WHEN device_id LIKE 'DEV%' THEN device_id ELSE NULL END
                ELSE
                    CASE WHEN risk_level LIKE 'DEV%' THEN risk_level ELSE NULL END
            END AS device_id,
            alert_status
        FROM transactions
        """
    )

    # ==========================================
    # AUDIT LOGS TABLE
    # ==========================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id TEXT DEFAULT 'admin',

            action TEXT NOT NULL,

            target_type TEXT NOT NULL,

            target_id TEXT NOT NULL,

            details TEXT,

            timestamp TEXT NOT NULL

        )
        """
    )

    # ==========================================
    # FRAUD RULES ENGINE TABLE
    # ==========================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS fraud_rules(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            rule_name TEXT NOT NULL,

            rule_type TEXT NOT NULL,

            description TEXT,

            condition TEXT,

            threshold REAL,

            severity TEXT DEFAULT 'HIGH',

            is_active INTEGER DEFAULT 1,

            created_at TEXT

        )
        """
    )

    # Seed default fraud rules if empty
    cursor.execute("SELECT COUNT(*) FROM fraud_rules")
    if cursor.fetchone()[0] == 0:
        default_rules = [
            ("Off-Hours Large Transfer", "VELOCITY", "Flag transfers over ৳50,000 between 12 AM and 5 AM", "amount > 50000 AND (txn_hour < 5 OR txn_hour >= 23)", 50000, "CRITICAL", 1, "2026-09-01"),
            ("New Device High Risk", "DEVICE", "New device with amount exceeding ৳30,000", "new_device_flag == 1 AND amount > 30000", 30000, "HIGH", 1, "2026-09-01"),
            ("Rapid Cash-Out Burst", "PATTERN", "Immediate withdrawal exceeding 85% of recently deposited funds", "channel == 'Cash Out' AND amount > 40000", 40000, "CRITICAL", 1, "2026-09-01"),
            ("P2P Structuring Threshold", "AML", "Transactions near standard reporting limit (৳45k - ৳50k)", "amount >= 45000 AND amount < 50000", 45000, "MEDIUM", 1, "2026-09-01"),
            ("Multi-Account Device Anomaly", "GRAPH", "Device connected to 3 or more distinct customer accounts", "linked_accounts >= 3", 3, "HIGH", 1, "2026-09-01"),
        ]
        cursor.executemany(
            """
            INSERT INTO fraud_rules (rule_name, rule_type, description, condition, threshold, severity, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            default_rules
        )

    # ==========================================
    # COMMIT CHANGES
    # ==========================================

    conn.commit()

    conn.close()

    print(
        "Database tables and migrations completed successfully"
    )