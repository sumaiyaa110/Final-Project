def generate_risk_explanation(transaction):

    reasons = []

    if transaction["amount"] > 1000:
        reasons.append(
            "High transaction amount"
        )

    if transaction["risk_score"] > 80:
        reasons.append(
            "High ML risk score"
        )

    if transaction["device_id"]:
        reasons.append(
            "Device behavior requires verification"
        )


    return {

        "risk_score":
            transaction["risk_score"],

        "confidence":
            "High"
            if transaction["risk_score"] > 80
            else "Medium",

        "model":
            "XGBoost v1.0",

        "reasons":
            reasons

    }