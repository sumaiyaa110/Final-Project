import pandas as pd
import random
import time

from datetime import datetime

from services.predictor import predict_transaction
from services.database import get_connection
from services.agent_service import assign_fraud_case


DATA_PATH = "data/transactions_v4.csv"


# =====================================================
# REAL WORLD FRAUD RATE
# =====================================================

TARGET_FRAUD_RATE = 0.003


# =====================================================
# LOAD TRANSACTION DATA
# =====================================================

transactions_df = pd.read_csv(

    DATA_PATH,

    usecols=[

        "amount",
        "channel",
        "txn_hour",
        "new_device_flag"

    ]

)


print(
    "Simulator loaded:",
    transactions_df.shape
)


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
# EXISTING CUSTOMERS
# =====================================================

def get_existing_customers():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT DISTINCT customer_id

        FROM transactions

        WHERE customer_id IS NOT NULL

        LIMIT 5000
        """
    )


    customers = [

        row[0]

        for row in cursor.fetchall()

    ]


    conn.close()


    return customers


# =====================================================
# EXISTING DEVICES
# =====================================================

def get_existing_devices():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT device_id

        FROM devices

        LIMIT 5000
        """
    )


    devices = [

        row[0]

        for row in cursor.fetchall()

    ]


    conn.close()


    return devices


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


# =====================================================
# GENERATE TRANSACTION
# =====================================================

def generate_transaction():

    # =================================================
    # SELECT RANDOM TRANSACTION DATA
    # =================================================

    index = random.randint(

        0,

        len(transactions_df) - 1

    )


    row = transactions_df.iloc[index]


    transaction = {

        "amount":
            float(row["amount"]),

        "channel":
            str(row["channel"]),

        "txn_hour":
            int(row["txn_hour"]),

        "new_device_flag":
            int(row["new_device_flag"])

    }


    # =================================================
    # CUSTOMER SELECTION
    # =================================================

    existing_customers = get_existing_customers()


    if (

        existing_customers

        and random.random() < 0.8

    ):

        customer_id = random.choice(
            existing_customers
        )

    else:

        customer_id = generate_customer_id()


    # =================================================
    # DEVICE SELECTION
    # =================================================

    existing_devices = get_existing_devices()


    if (

        existing_devices

        and random.random() < 0.7

    ):

        device_id = random.choice(
            existing_devices
        )

    else:

        device_id = generate_device_id()


    # =================================================
    # ML PREDICTION
    # =================================================

    result = predict_transaction(
        transaction
    )


    # =================================================
    # FRAUD CONTROL
    # =================================================

    is_fraud_case = False


    if random.random() > TARGET_FRAUD_RATE:

        # ---------------------------------------------
        # NORMAL TRANSACTION
        # ---------------------------------------------

        result["risk_level"] = "LOW"


        result["risk_score"] = round(

            min(

                result["risk_score"],

                29.99

            ),

            2

        )


    else:

        # ---------------------------------------------
        # FRAUD TRANSACTION
        # ---------------------------------------------

        is_fraud_case = True


        result["risk_level"] = "HIGH"


        result["risk_score"] = random.randint(

            70,

            95

        )


    # =================================================
    # ALERT STATUS
    # =================================================
    # Every newly generated transaction starts as
    # Pending.
    #
    # Only HIGH / CRITICAL transactions will actually
    # appear on the Fraud Alerts page.
    # =================================================

    alert_status = "Pending"


    # =================================================
    # DATABASE CONNECTION
    # =================================================

    conn = get_connection()
    cursor = conn.cursor()


    # =================================================
    # INSERT TRANSACTION
    # =================================================

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

            alert_status
        )

        VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )

        """,

        (

            datetime.now().isoformat(),

            transaction["amount"],

            transaction["channel"],

            transaction["txn_hour"],

            transaction["new_device_flag"],


            float(
                result["fraud_probability"]
            ),


            float(
                result["anomaly_score"]
            ),


            float(
                result["risk_score"]
            ),


            result["risk_level"],


            customer_id,


            device_id,


            alert_status

        )

    )


    # =================================================
    # UPDATE DEVICE
    # =================================================

    cursor.execute(

        """
        SELECT

            linked_accounts,

            transaction_count

        FROM devices

        WHERE device_id = ?

        """,

        (device_id,)

    )


    existing = cursor.fetchone()


    if existing:

        accounts = existing[0] + 1

        transactions = existing[1] + 1

    else:

        accounts = 1

        transactions = 1


    # =================================================
    # CALCULATE DEVICE RISK
    # =================================================

    device_risk = calculate_device_risk(
        accounts
    )


    # =================================================
    # INSERT / UPDATE DEVICE
    # =================================================

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

        VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )

        """,

        (

            device_id,

            "Android",

            "Mobile Device",

            device_risk,

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

        VALUES(
            ?,
            ?,
            ?,
            ?
        )

        """,

        (

            customer_id,

            device_id,

            transaction["amount"],

            1

        )

    )


    # =================================================
    # SAVE DATABASE CHANGES
    # =================================================

    conn.commit()

    conn.close()


    # =================================================
    # FRAUD CASE ASSIGNMENT
    # =================================================

    if is_fraud_case:

        assign_fraud_case()


    # =================================================
    # LOG
    # =================================================

    print(

        "Inserted:",

        result,

        "| Customer:",

        customer_id,

        "| Device:",

        device_id,

        "| Alert Status:",

        alert_status

    )


    return result


# =====================================================
# BACKGROUND SIMULATOR
# =====================================================

def start_simulator(interval=5):

    print(
        "Real-time simulator started"
    )


    while True:

        try:

            generate_transaction()


        except Exception as e:

            print(

                "Simulator Error:",

                e

            )


        time.sleep(interval)