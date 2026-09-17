from services.database import get_connection
from datetime import datetime


def get_reports():

    conn = get_connection()
    cursor = conn.cursor()


    # Total transactions
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        """
    )

    total_transactions = cursor.fetchone()[0]



    # Fraud transactions
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM transactions
        WHERE risk_level IN ('HIGH','CRITICAL')
        """
    )

    fraud_transactions = cursor.fetchone()[0]



    # High risk entities
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM devices
        WHERE risk IN ('High','Critical')
        """
    )

    high_risk = cursor.fetchone()[0]



    reports = [

        {
            "id":"RPT-001",
            "name":"Fraud Detection Report",
            "type":"Fraud",
            "period":"Real Time",
            "records":str(fraud_transactions),
            "generated":"Just now",
            "status":"Ready"
        },


        {
            "id":"RPT-002",
            "name":"Transaction Activity Report",
            "type":"Transaction",
            "period":"Real Time",
            "records":str(total_transactions),
            "generated":"Just now",
            "status":"Ready"
        },


        {
            "id":"RPT-003",
            "name":"High Risk Entity Report",
            "type":"Risk",
            "period":"Real Time",
            "records":str(high_risk),
            "generated":"Just now",
            "status":"Ready"
        },


    ]


    conn.close()


    return reports