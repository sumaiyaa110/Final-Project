from services import simulator


def test_health(client):

    assert client.get("/health").json() == {"status": "OK"}


def test_dashboard_and_summaries(client):

    dashboard = client.get("/dashboard").json()
    summary = client.get("/transaction-summary").json()

    assert dashboard["total_transactions"] == summary["total_transactions"]
    assert dashboard["fraud_alerts"] == summary["high_risk_transactions"]


def test_alert_summary_counts_are_consistent(client):

    summary = client.get("/alert-summary").json()

    assert summary["total_alerts"] == summary["high_risk"] + summary["critical"]
    assert summary["pending"] <= summary["total_alerts"]


def test_analytics_use_clean_channels(client):

    channels = {row["channel"] for row in client.get("/channel-distribution").json()}

    assert channels <= {"P2P", "Merchant Payment", "Cash-Out", "Cash-In", "Bill Pay"}


def test_transaction_explanation(client):

    transaction = client.get("/transactions").json()[0]

    explanation = client.get(f"/transaction/{transaction['id']}/explanation")

    assert explanation.status_code == 200

    body = explanation.json()

    assert body["transaction_id"] == transaction["id"]
    assert body["reasons"]
    assert "top_contributions" in body["feature_contributions"]
    assert "fraud_probability" in body["ml_models"]["xgboost"]


def test_missing_transaction_explanation_is_404(client):

    assert client.get("/transaction/TXN-99999999/explanation").status_code == 404


def test_agents_are_distinguishable(client):

    agents = client.get("/agents").json()

    assert agents
    assert len({agent["name"] for agent in agents}) == len(agents)
    assert len({agent["email"] for agent in agents}) == len(agents)


def test_investigation_ids_are_stable(client):

    first = client.get("/investigations").json()
    second = client.get("/investigations").json()

    assert [i["id"] for i in first] == [i["id"] for i in second]
    assert all(i["id"] == f"INV-{i['device']}" for i in first)


def test_network_summary(client):

    network = client.get("/network").json()

    assert network["summary"]["connections"] > 0
    assert len(network["edges"]) <= 80


def test_device_endpoints(client):

    device_id = client.get("/devices").json()[0]["id"]

    assert client.get(f"/device/{device_id}").json()["success"] is True
    assert client.get(f"/device/{device_id}/transactions").json()["success"] is True


def test_investigation_action_round_trip(client):

    transaction_id = client.get("/transactions").json()[0]["id"]

    response = client.post(
        f"/investigation-action/{transaction_id}",
        json={"status": "UNDER_REVIEW", "notes": "test"},
    ).json()

    assert response["success"] is True

    history = client.get(f"/investigation-action/{transaction_id}").json()

    assert history["current_status"] == "UNDER_REVIEW"


def test_simulated_transaction_is_explained_with_full_features(client):

    if not simulator.simulator_available():
        return

    simulator.generate_transaction()

    newest = client.get("/transactions").json()[0]

    body = client.get(f"/transaction/{newest['id']}/explanation").json()

    assert body["feature_contributions"]["full_features"] is True
