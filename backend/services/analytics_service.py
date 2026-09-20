from services.database import get_connection

from datetime import datetime

# ==========================================
# Transaction Trend
# ==========================================
def get_transaction_trend():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            DATE(timestamp) as date,

            COUNT(*) as transactions,

            SUM(
                CASE
                    WHEN risk_level IN ('HIGH','CRITICAL')
                    THEN 1
                    ELSE 0
                END
            ) as suspicious


        FROM transactions

        GROUP BY DATE(timestamp)

        ORDER BY date DESC

        LIMIT 30

        """
    )

    rows = cursor.fetchall()

    conn.close()

    # reverse order for chart

    rows = rows[::-1]

    result = []

    for row in rows:


        result.append({

            "date": row[0],

            "transactions": row[1],

            "suspicious": row[2] or 0

        })

    return result

# ==========================================
# Transaction Channel Distribution
# ==========================================
def get_channel_distribution():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(

        """

        SELECT

            channel,

            COUNT(*) as count


        FROM transactions


        GROUP BY channel


        """

    )

    rows = cursor.fetchall()

    conn.close()

    return [

        {

            "channel": row[0],

            "count": row[1]

        }

        for row in rows

    ]

# ==========================================
# Fraud Types
# ==========================================
def get_fraud_types():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(

        """

        SELECT

            channel,

            COUNT(*) as count


        FROM transactions


        WHERE risk_level IN ('HIGH','CRITICAL')


        GROUP BY channel


        ORDER BY count DESC


        """

    )

    rows = cursor.fetchall()

    conn.close()

    fraud_types = []

    for row in rows:

        fraud_types.append({

            "type": row[0],

            "count": row[1]

        })

    return fraud_types

# ==========================================
# AI Insights
# ==========================================
def get_ai_insights():

    conn = get_connection()
    cursor = conn.cursor()

    insights = []

    cursor.execute(

        """

        SELECT COUNT(*)

        FROM transactions

        WHERE risk_level IN ('HIGH','CRITICAL')

        """

    )

    high_risk = cursor.fetchone()[0]

    if high_risk > 0:

        insights.append(

            f"{high_risk} high risk transactions detected."

        )

    cursor.execute(

        """

        SELECT channel, COUNT(*)

        FROM transactions

        GROUP BY channel

        ORDER BY COUNT(*) DESC

        LIMIT 1

        """

    )

    result = cursor.fetchone()

    if result:

        insights.append(

            f"Most transactions are occurring through {result[0]} channel."

        )

    conn.close()

    return {

        "insights": insights

    }