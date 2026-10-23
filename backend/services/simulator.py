import json
import random
import time

import pandas as pd

from datetime import datetime
from pathlib import Path

from services.predictor import predict_transaction, build_feature_row
from services.database import get_connection
from services.agent_service import assign_fraud_case


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "transactions_v4.csv"


# Raw dataset columns the models' features are built from
FEATURE_COLUMNS = [
    "amount",
    "balance_before",
    "new_device_flag",
    "new_counterparty_flag",
    "txn_hour",
    "day_of_week",
    "is_night_transaction",
    "is_salary_period",
    "is_eid_period",
    "amount_log",
    "high_amount_flag",
    "customer_txn_count_24h",
    "customer_amount_sum_24h",
    "avg_txn_amount",
    "network_risk_score",
    "channel",
    "location",
    "merchant_category"
]

# How often the cached customer / device ID lists are reloaded
ID_CACHE_SECONDS = 60


# =====================================================
# LOAD TRANSACTION DATA
# =====================================================

def load_transactions():

    if not DATA_PATH.exists():

        print("Simulator disabled: dataset not found at", DATA_PATH)

        return None

    with open(DATA_PATH, "rb") as f:

        if f.read(40).startswith(b"version https://git-lfs"):

            print(
                "Simulator disabled:",
                DATA_PATH.name,
                "is a Git LFS pointer. Run `git lfs pull` to fetch it."
            )

            return None

    df = pd.read_csv(
        DATA_PATH,
        usecols=FEATURE_COLUMNS
    )

    for col in ("channel", "location", "merchant_category"):
        df[col] = df[col].astype("category")

    print(
        "Simulator loaded:",
        df.shape
    )

    return df


transactions_df = load_transactions()


def simulator_available():

    return transactions_df is not None


# =====================================================
# ID GENERATORS
# =====================================================

def generate_device_id():

    return "DEV-" + str(
        random.randint(10000, 99999)
    )


def generate_customer_id():

    return "CUST-" + str(
        random.randint(10000, 99999)
    )


# =====================================================
# EXISTING CUSTOMERS / DEVICES (cached)
# =====================================================

_id_cache = {
    "loaded_at": 0.0,
    "customers": [],
    "devices": []
}


def get_existing_ids():

    if time.time() - _id_cache["loaded_at"] < ID_CACHE_SECONDS:
        return _id_cache["customers"], _id_cache["devices"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT DISTINCT customer_id
        FROM transactions_clean
        WHERE customer_id LIKE 'CUST-%'
        LIMIT 5000
        """
    )

    _id_cache["customers"] = [row[0] for row in cursor.fetchall()]

    cursor.execute(
        """
        SELECT device_id
        FROM devices
        LIMIT 5000
        """
    )

    _id_cache["devices"] = [row[0] for row in cursor.fetchall()]

    conn.close()

    _id_cache["loaded_at"] = time.time()

    return _id_cache["customers"], _id_cache["devices"]


# =====================================================
# DEVICE RISK
# =====================================================

def calculate_device_risk(accounts):

    if accounts >= 10:

        return "Critical"

    elif accounts >= 5:

        return "High"

    elif accounts >= 3:

        return "Medium"

    else:

        return "Low"


def _plain(value):

    return value.item() if hasattr(value, "item") else value


# =====================================================
# GENERATE TRANSACTION
# =====================================================

def generate_transaction():

    if transactions_df is None:
        return None

    # =================================================
    # SELECT RANDOM TRANSACTION DATA
    # =================================================

    row = transactions_df.iloc[
        random.randint(0, len(transactions_df) - 1)
    ]

    transaction = {
        col: _plain(row[col])
        for col in FEATURE_COLUMNS
    }

    for col in ("channel", "location", "merchant_category"):
        transaction[col] = str(transaction[col])


    # =================================================
    # CUSTOMER / DEVICE SELECTION
    # =================================================

    existing_customers, existing_devices = get_existing_ids()

    if existing_customers and random.random() < 0.8:

        customer_id = random.choice(existing_customers)

    else:

        customer_id = generate_customer_id()

        existing_customers.append(customer_id)

    if existing_devices and random.random() < 0.7:

        device_id = random.choice(existing_devices)

    else:

        device_id = generate_device_id()

        existing_devices.append(device_id)


    # =================================================
    # ML PREDICTION
    # =================================================
    # The fraud rate comes from the data itself
    # (~0.3% of the dataset is fraud), so the model's
    # verdict is stored as-is.

    result = predict_transaction(transaction)

    is_fraud_case = result["risk_level"] in ("HIGH", "CRITICAL")

    features = build_feature_row(transaction)


    # =================================================
    # INSERT TRANSACTION
    # =================================================
    # Every new transaction starts as Pending. Only
    # HIGH / CRITICAL ones appear on the Fraud Alerts page.

    alert_status = "Pending"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO transactions
        (
            timestamp,
            amount,
            channel,
            txn_hour,
            new_device_flag,
            fraud_probability,
            anomaly_score,
            risk_score,
            risk_level,
            customer_id,
            device_id,
            alert_status,
            features
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            datetime.now().isoformat(),
            float(transaction["amount"]),
            transaction["channel"],
            int(transaction["txn_hour"]),
            int(transaction["new_device_flag"]),
            float(result["fraud_probability"]),
            float(result["anomaly_score"]),
            float(result["risk_score"]),
            result["risk_level"],
            customer_id,
            device_id,
            alert_status,
            json.dumps(features)
        )
    )


    # =================================================
    # UPDATE DEVICE
    # =================================================

    cursor.execute(
        """
        SELECT COUNT(DISTINCT customer_id), COUNT(*)
        FROM transactions_clean
        WHERE device_id = ?
        """,
        (device_id,)
    )

    dev_stats = cursor.fetchone()
    accounts = max(int(dev_stats[0] or 0), 1)
    transactions = int(dev_stats[1] or 0)

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            device_id,
            "Android",
            "Mobile Device",
            calculate_device_risk(accounts),
            accounts,
            transactions,
            datetime.now().isoformat(),
            "Active"
        )
    )


    # =================================================
    # NETWORK
    # =================================================

    cursor.execute(
        """
        INSERT INTO network_edges
        (
            source,
            target,
            amount,
            transaction_count
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            customer_id,
            device_id,
            float(transaction["amount"]),
            1
        )
    )

    conn.commit()
    conn.close()


    # =================================================
    # FRAUD CASE ASSIGNMENT
    # =================================================

    if is_fraud_case:

        assign_fraud_case()


    print(
        "Inserted:",
        result,
        "| Customer:",
        customer_id,
        "| Device:",
        device_id
    )

    return result
