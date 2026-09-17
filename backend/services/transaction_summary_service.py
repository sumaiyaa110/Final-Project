from services.database import get_connection



def get_transaction_summary():


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




    # High risk

    cursor.execute(
    """
    SELECT COUNT(*)
    FROM transactions

    WHERE risk_level IN
    ('HIGH','High','Critical')

    """
    )

    high_risk = cursor.fetchone()[0]





    # Total amount

    cursor.execute(
    """
    SELECT SUM(amount)
    FROM transactions
    """
    )

    total_amount = cursor.fetchone()[0] or 0





    # Fraud rate

    if total_transactions > 0:

        fraud_rate = (
            high_risk /
            total_transactions
        ) * 100

    else:

        fraud_rate = 0





    conn.close()



    return {


        "total_transactions":
            total_transactions,


        "high_risk_transactions":
            high_risk,


        "fraud_rate":
            round(
                fraud_rate,
                2
            ),


        "total_amount":
            round(
                total_amount,
                2
            )

    }