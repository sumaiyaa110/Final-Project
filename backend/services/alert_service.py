from services.database import get_connection
from datetime import datetime



def get_fraud_alerts():

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute(
    """
    SELECT

        id,
        timestamp,
        amount,
        channel,
        risk_score,
        risk_level

    FROM transactions

    WHERE risk_level IN ('HIGH','Critical','MEDIUM')

    ORDER BY id DESC

    LIMIT 100

    """
    )


    rows = cursor.fetchall()


    alerts=[]


    for row in rows:


        txn_id = row[0]


        risk = row[5]


        if risk.lower()=="critical":

            alert_type="Critical Transaction"

            icon="⚠"


        elif risk.lower()=="high":

            alert_type="High Risk Transaction"

            icon="▲"


        else:

            alert_type="Suspicious Activity"

            icon="◉"



        alerts.append({

            "id":f"ALT-{txn_id}",

            "type":alert_type,

            "description":
            f"{row[2]} amount transaction detected",

            "icon":icon,

            "risk":risk.capitalize(),

            "transaction":
            f"TXN-{txn_id}",

            "customer":
            "CUSTOMER-"+str(txn_id),

            "detected":
            row[1],

            "status":
            "Pending"

        })


    conn.close()


    return alerts





def get_alert_summary():


    conn=get_connection()

    cursor=conn.cursor()


    cursor.execute(
    """
    SELECT COUNT(*)
    FROM transactions
    """
    )

    total=cursor.fetchone()[0]



    cursor.execute(
    """
    SELECT COUNT(*)
    FROM transactions
    WHERE risk_level='HIGH'
    """
    )

    high=cursor.fetchone()[0]



    cursor.execute(
    """
    SELECT COUNT(*)
    FROM transactions
    WHERE risk_level='Critical'
    """
    )

    critical=cursor.fetchone()[0]


    conn.close()



    return {

        "total_alerts":total,

        "critical":critical,

        "high_risk":high,

        "pending":critical+high

    }