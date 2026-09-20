from services.database import get_connection
from datetime import datetime



def get_reports():


    conn = get_connection()

    cursor = conn.cursor()



    # ==========================================
    # TOTAL TRANSACTIONS
    # ==========================================

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        """
    )

    total_transactions = cursor.fetchone()[0]



    # ==========================================
    # FRAUD TRANSACTIONS
    # ==========================================

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        WHERE UPPER(risk_level)
        IN ('HIGH','CRITICAL')
        """
    )

    fraud_transactions = cursor.fetchone()[0]



    # ==========================================
    # MEDIUM RISK TRANSACTIONS
    # ==========================================

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        WHERE UPPER(risk_level)
        = 'MEDIUM'
        """
    )

    medium_risk = cursor.fetchone()[0]



    # ==========================================
    # HIGH RISK DEVICES
    # ==========================================

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM devices
        WHERE UPPER(risk)
        IN ('HIGH','CRITICAL')
        """
    )

    high_risk_entities = cursor.fetchone()[0]



    # ==========================================
    # CUSTOMER COUNT
    # ==========================================

    cursor.execute(
        """
        SELECT COUNT(DISTINCT customer_id)
        FROM transactions
        WHERE customer_id IS NOT NULL
        """
    )

    customers = cursor.fetchone()[0]



    now = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )



    reports = [



        {
            "id":
                "RPT-001",

            "name":
                "Fraud Detection Report",

            "type":
                "Fraud",

            "period":
                "Real Time",

            "records":
                str(fraud_transactions),

            "generated":
                now,

            "status":
                "Ready"
        },




        {
            "id":
                "RPT-002",

            "name":
                "Transaction Activity Report",

            "type":
                "Transaction",

            "period":
                "Real Time",

            "records":
                str(total_transactions),

            "generated":
                now,

            "status":
                "Ready"
        },




        {
            "id":
                "RPT-003",

            "name":
                "High Risk Entity Report",

            "type":
                "Risk",

            "period":
                "Real Time",

            "records":
                str(high_risk_entities),

            "generated":
                now,

            "status":
                "Ready"
        },




        {
            "id":
                "RPT-004",

            "name":
                "Investigation Case Report",

            "type":
                "Investigation",

            "period":
                "Real Time",

            "records":
                str(fraud_transactions),

            "generated":
                now,

            "status":
                "Ready"
        },




        {
            "id":
                "RPT-005",

            "name":
                "Customer Risk Overview",

            "type":
                "Risk",

            "period":
                "Real Time",

            "records":
                str(customers),

            "generated":
                now,

            "status":
                "Ready"
        },



        {
            "id":
                "RPT-006",

            "name":
                "Medium Risk Review Report",

            "type":
                "Investigation",

            "period":
                "Real Time",

            "records":
                str(medium_risk),

            "generated":
                now,

            "status":
                "Ready"
        }



    ]


    conn.close()


    return reports