import json

from services.database import get_connection
from services.model_loader import fraud_threshold, anomaly_threshold
from services.predictor import build_feature_row, explain_features
from services.transaction_detail_service import get_transaction_detail
from services.customer_profile_service import (
    fetch_customer_transactions,
    build_behavior_profile,
)


def _stored_features(cursor, real_id):
    """
    Model features saved by the simulator. Older rows don't have them,
    so the basic stored columns are used instead.
    """

    cursor.execute(
        "SELECT features FROM transactions WHERE id = ?",
        (real_id,)
    )

    row = cursor.fetchone()

    if row and row[0]:
        try:
            return json.loads(row[0]), True
        except (TypeError, ValueError):
            pass

    return None, False


def generate_risk_explanation(transaction_id):

    transaction = get_transaction_detail(transaction_id)

    if "error" in transaction:
        return None

    real_id = int(transaction["id"].replace("TXN-", ""))

    conn = get_connection()
    cursor = conn.cursor()

    features, full_features = _stored_features(cursor, real_id)

    if features is None:
        features = build_feature_row({
            "amount": transaction["raw_amount"],
            "channel": transaction["type"],
            "new_device_flag": transaction["new_device"],
        })

    customer_txns = []

    if transaction["customer"] != "Unknown":
        customer_txns = fetch_customer_transactions(
            cursor,
            transaction["customer"],
            upto_id=real_id
        )

    conn.close()

    # ---------------------------------------------
    # MODEL OUTPUTS
    # ---------------------------------------------

    fraud_probability = transaction["fraud_probability"]
    anomaly_score = transaction["anomaly_score"]

    contributions = explain_features(features)

    # ---------------------------------------------
    # REASONS
    # ---------------------------------------------

    reasons = [
        reason for reason in transaction["reasons"]
        if reason != "No major suspicious pattern detected"
    ]

    if fraud_probability >= fraud_threshold:
        reasons.append(
            f"XGBoost fraud probability {fraud_probability:.0%} is above "
            f"the {fraud_threshold:.0%} decision threshold"
        )

    if anomaly_score >= anomaly_threshold:
        reasons.append(
            f"Isolation Forest anomaly score {anomaly_score:.3f} is above "
            f"the {anomaly_threshold:.3f} threshold"
        )

    for item in contributions["top_contributions"]:
        if item["contribution"] > 0 and len(reasons) < 6:
            reasons.append(
                f"Model driver: {item['feature'].replace('_', ' ')}"
            )

    if not reasons:
        reasons.append("No major suspicious pattern detected")

    # ---------------------------------------------
    # BEHAVIORAL SIGNALS
    # ---------------------------------------------

    behavioral_signals = []

    if customer_txns:
        profile = build_behavior_profile(customer_txns)

        behavioral_signals = [
            {
                "label": deviation["label"],
                "detail": deviation["detail"],
                "severity": deviation["severity"],
            }
            for deviation in profile.get("deviations", [])
            if deviation["triggered"]
        ]

    return {

        "transaction_id": transaction["id"],

        "risk_score": transaction["score"],

        "risk_level": transaction["level"],

        # How certain XGBoost is of its own verdict
        "confidence": round(
            max(fraud_probability, 1 - fraud_probability) * 100,
            1
        ),

        "model": "XGBoost + Isolation Forest",

        "reasons": reasons,

        "feature_contributions": {
            **contributions,
            "method": "TreeSHAP (XGBoost pred_contribs)",
            "full_features": full_features,
        },

        "ml_models": {
            "xgboost": {
                "fraud_probability": fraud_probability,
                "threshold": round(float(fraud_threshold), 4),
                "flagged": fraud_probability >= fraud_threshold,
            },
            "isolation_forest": {
                "anomaly_score": anomaly_score,
                "threshold": round(float(anomaly_threshold), 4),
                "flagged": anomaly_score >= anomaly_threshold,
            },
        },

        "behavioral_signals": behavioral_signals,

    }
