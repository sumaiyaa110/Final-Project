import pytest

from services.model_loader import fraud_threshold, anomaly_threshold
from services.predictor import (
    build_feature_row,
    explain_features,
    fuse_risk,
    predict_transaction,
)
from services import simulator


def test_fuse_risk_levels_follow_thresholds():

    assert fuse_risk(0.0, 0.0) == (0.0, "LOW")

    score, level = fuse_risk(fraud_threshold, 0.0)
    assert score == 60 and level == "HIGH"

    score, level = fuse_risk(1.0, 1.0)
    assert score == 100 and level == "CRITICAL"

    # A strong anomaly alone lifts a clean transaction, but not into HIGH
    score, level = fuse_risk(0.0, 1.0)
    assert score == 15 and level == "LOW"

    assert fuse_risk(0.0, anomaly_threshold)[0] == 0


def test_build_feature_row_derives_training_features():

    row = build_feature_row({
        "amount": 9000,
        "avg_txn_amount": 1000,
        "txn_hour": 3,
        "customer_txn_count_24h": 6,
        "new_device_flag": True,
    })

    assert row["is_night_transaction"] == 1
    assert row["amount_vs_customer_avg"] == 9
    assert row["amount_deviation_flag"] == 1
    assert row["is_high_velocity"] == 1
    assert row["new_device_flag"] == 1


def test_predict_accepts_minimal_input():

    result = predict_transaction({
        "amount": 50000,
        "channel": "P2P",
        "txn_hour": 23,
        "new_device_flag": 1,
    })

    assert 0 <= result["fraud_probability"] <= 1
    assert 0 <= result["risk_score"] <= 100
    assert result["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


def test_explain_features_returns_treeshap_contributions():

    explanation = explain_features(
        build_feature_row({"amount": 50000, "channel": "P2P", "txn_hour": 2})
    )

    contributions = explanation["top_contributions"]

    assert contributions
    assert all(
        abs(a["contribution"]) >= abs(b["contribution"])
        for a, b in zip(contributions, contributions[1:])
    )


@pytest.mark.skipif(
    not simulator.simulator_available(),
    reason="transactions_v4.csv not available (run `git lfs pull`)"
)
def test_model_separates_fraud_from_normal_rows():

    import pandas as pd

    df = pd.read_csv(simulator.DATA_PATH, usecols=simulator.FEATURE_COLUMNS + ["is_fraud"])

    fraud = df[df["is_fraud"]].sample(100, random_state=0)
    normal = df[~df["is_fraud"]].sample(500, random_state=0)

    def flagged(rows):
        return sum(
            predict_transaction(row.drop("is_fraud").to_dict())["risk_level"]
            in ("HIGH", "CRITICAL")
            for _, row in rows.iterrows()
        )

    assert flagged(fraud) >= 40
    assert flagged(normal) <= 5
