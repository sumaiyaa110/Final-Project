"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import AdminLayout from "@/components/layout/AdminLayout";

import { getAlerts, getAlertSummary, resolveAlert } from "@/services/api";

type AlertStatus = "Pending" | "Investigating" | "Resolved";

type Alert = {
  id: string;

  type: string;

  description: string;

  icon: string;

  risk: "Critical" | "High" | "Medium";

  transaction: string;

  customer: string;

  detected: string;

  status: AlertStatus;
};

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [summary, setSummary] = useState<any>(null);

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] = useState("All Risk Levels");

  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [loading, setLoading] = useState(true);

  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState("");

  // =====================================================
  // LOAD REALTIME DATA
  // =====================================================

  useEffect(() => {
    async function loadData() {
      try {
        const alertData = await getAlerts();

        const summaryData = await getAlertSummary();

        setAlerts(alertData);

        setSummary(summaryData);
      } catch (error) {
        console.log("Alert API error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAlerts = alerts.filter((alert) => {
    const value = search.toLowerCase().trim();

    const matchesSearch =
      value === "" ||
      alert.id.toLowerCase().includes(value) ||
      alert.type.toLowerCase().includes(value) ||
      alert.transaction.toLowerCase().includes(value) ||
      alert.customer.toLowerCase().includes(value);

    const matchesRisk =
      riskFilter === "All Risk Levels" || alert.risk === riskFilter;

    const matchesStatus =
      statusFilter === "All Statuses" || alert.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // =====================================================
  // RESOLVE ALERT
  // =====================================================

  async function markAsResolved(alertId: string) {
    if (resolvingId) {
      return;
    }

    try {
      setResolvingId(alertId);

      const result = await resolveAlert(alertId);

      if (!result.success) {
        throw new Error(result.message || "Unable to resolve alert");
      }

      // ==========================================
      // REMOVE RESOLVED ALERT FROM CURRENT LIST
      // ==========================================

      setAlerts((currentAlerts) =>
        currentAlerts.filter((alert) => alert.id !== alertId),
      );

      // ==========================================
      // UPDATE PENDING COUNT IMMEDIATELY
      // ==========================================

      setSummary((currentSummary) => {
        if (!currentSummary) {
          return currentSummary;
        }

        return {
          ...currentSummary,

          pending: Math.max(0, Number(currentSummary.pending) - 1),

          resolved: Number(currentSummary.resolved || 0) + 1,

          total_alerts: currentSummary.total_alerts,
        };
      });

      setActionMessage("Alert resolved successfully.");

      setTimeout(() => {
        setActionMessage("");
      }, 2500);
    } catch (error) {
      console.log("Resolve alert error:", error);

      setActionMessage("Unable to resolve alert.");

      setTimeout(() => {
        setActionMessage("");
      }, 2500);
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="fraud-alerts-page">
        {/* =========================================
            HEADER
        ========================================== */}

        <div className="fraud-alerts-page-header">
          <div>
            <h1>Fraud Alerts</h1>

            <p>Potentially fraudulent activities detected by our AI models.</p>
          </div>
        </div>

        {/* =========================================
            SUCCESS MESSAGE
        ========================================== */}

        {actionMessage && (
          <div className="fraud-alert-action-message">✓ {actionMessage}</div>
        )}

        {/* =========================================
            SUMMARY
        ========================================== */}

        <div className="fraud-alert-summary">
          <div className="fraud-alert-summary-card">
            <div className="fraud-alert-summary-top">
              <span>Total Alerts</span>

              <div className="fraud-alert-summary-icon blue">◉</div>
            </div>

            <strong>{summary ? summary.total_alerts : "Loading..."}</strong>

            <div className="fraud-alert-summary-bottom">
              <span>Live Monitoring</span>
            </div>
          </div>

          {/* CRITICAL */}

          <div className="fraud-alert-summary-card critical">
            <div className="fraud-alert-summary-top">
              <span>Critical</span>

              <div className="fraud-alert-summary-icon red">!</div>
            </div>

            <strong>{summary ? summary.critical : 0}</strong>
          </div>

          {/* HIGH */}

          <div className="fraud-alert-summary-card high">
            <div className="fraud-alert-summary-top">
              <span>High Risk</span>

              <div className="fraud-alert-summary-icon orange">▲</div>
            </div>

            <strong>{summary ? summary.high_risk : 0}</strong>
          </div>

          {/* PENDING */}

          <div className="fraud-alert-summary-card pending">
            <div className="fraud-alert-summary-top">
              <span>Pending Review</span>

              <div className="fraud-alert-summary-icon yellow">◷</div>
            </div>

            <strong>{summary ? summary.pending : 0}</strong>
          </div>
        </div>

        {/* =========================================
            FILTERS
        ========================================== */}

        <div className="fraud-alert-filters">
          <div className="fraud-alert-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert, transaction or customer..."
            />
          </div>

          <select
            className="fraud-alert-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option>All Risk Levels</option>

            <option>Critical</option>

            <option>High</option>
          </select>

          <select
            className="fraud-alert-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>

            <option>Pending</option>

            <option>Investigating</option>

            <option>Resolved</option>
          </select>
        </div>

        {/* =========================================
            TABLE
        ========================================== */}

        <div className="fraud-alert-table-card">
          <div className="fraud-alert-table-header">
            <div>
              <h2>Recent Fraud Alerts</h2>

              <p>
                Review and investigate alerts detected by monitoring system.
              </p>
            </div>

            <span className="fraud-alert-count">
              {filteredAlerts.length} shown
            </span>
          </div>

          <div className="fraud-alert-table-wrapper">
            <table className="fraud-alert-table">
              <thead>
                <tr>
                  <th>ALERT</th>

                  <th>RISK</th>

                  <th>TRANSACTION</th>

                  <th>CUSTOMER</th>

                  <th>DETECTED</th>

                  <th>STATUS</th>

                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="fraud-alert-empty">
                      Loading alerts...
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="fraud-alert-empty">
                      No pending alerts found.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.id}>
                      {/* ALERT */}

                      <td>
                        <div className="alert-name">
                          <span
                            className={`alert-type-icon ${alert.risk.toLowerCase()}`}
                          >
                            {alert.icon}
                          </span>

                          <div>
                            <strong>{alert.type}</strong>

                            <span>{alert.description}</span>
                          </div>
                        </div>
                      </td>

                      {/* RISK */}

                      <td>
                        <span
                          className={`alert-risk ${alert.risk.toLowerCase()}`}
                        >
                          {alert.risk}
                        </span>
                      </td>

                      {/* TRANSACTION */}

                      <td>
                        <Link
                          href={`/transactions/${alert.transaction}`}
                          className="alert-transaction"
                        >
                          {alert.transaction}
                        </Link>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <Link
                          href={`/customers?search=${alert.customer}`}
                          className="alert-customer"
                        >
                          {alert.customer}
                        </Link>
                      </td>

                      {/* DETECTED */}

                      <td>
                        <span className="alert-time">{alert.detected}</span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`alert-status ${alert.status.toLowerCase()}`}
                        >
                          {alert.status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          className="alert-action-button"
                          onClick={() => markAsResolved(alert.id)}
                          disabled={
                            resolvingId === alert.id ||
                            alert.status === "Resolved"
                          }
                          title="Mark alert as resolved"
                        >
                          {resolvingId === alert.id ? "..." : "✓"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
