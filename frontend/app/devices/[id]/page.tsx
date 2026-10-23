"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getDeviceDetail, getDeviceTransactions } from "@/services/api";

export default function DeviceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const deviceId = typeof params?.id === "string" ? params.id : "";

  const [device, setDevice] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    async function loadData() {
      try {
        const [devRes, txRes] = await Promise.all([
          getDeviceDetail(deviceId),
          getDeviceTransactions(deviceId),
        ]);

        if (devRes && devRes.device) {
          setDevice(devRes.device);
        } else if (devRes && !devRes.device && devRes.id) {
          setDevice(devRes);
        } else {
          setDevice(null);
        }

        if (txRes && txRes.transactions) {
          setTransactions(txRes.transactions);
        } else if (Array.isArray(txRes)) {
          setTransactions(txRes);
        }
      } catch (err) {
        console.error("Device details fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading device intelligence...
        </div>
      </AdminLayout>
    );
  }

  if (!device) {
    return (
      <AdminLayout>
        <div className="device-details-not-found">
          <div className="device-not-found-icon">!</div>
          <h1>Device Not Found</h1>
          <p>
            The device <strong>{deviceId}</strong> could not be found in active records.
          </p>
          <button type="button" onClick={() => router.push("/devices")}>
            ← Back to Devices
          </button>
        </div>
      </AdminLayout>
    );
  }

  const linkedCustomers = device.linkedCustomers || [];
  const riskScore = device.riskScore ?? 0;
  const accountsCount = device.customerCount ?? device.accounts ?? 0;
  const transactionsCount = device.actualTransactions ?? device.transactions ?? 0;
  const status = device.status || "Active";
  const riskLevel = device.risk || (riskScore >= 70 ? "Critical" : riskScore >= 40 ? "High" : "Low");

  return (
    <AdminLayout>
      <div className="device-details-container">
        {/* =====================================================
            HEADER
            ===================================================== */}
        <div className="device-details-header">
          <div>
            <div className="device-header-breadcrumb">
              <Link href="/devices">Devices</Link> / <span>{device.id}</span>
            </div>

            <h1>Device Investigation</h1>

            <p>
              Detailed risk profile, associated customer accounts, and activity telemetry.
            </p>
          </div>

          <div className="device-header-actions">
            <button
              type="button"
              className="device-secondary-button"
              onClick={() => router.push(`/transactions?device=${device.id}`)}
            >
              View Transactions
            </button>

            <button
              type="button"
              className="device-primary-button"
              onClick={() => router.push(`/investigations?device=${device.id}`)}
            >
              Investigate Device
            </button>
          </div>
        </div>

        {/* =====================================================
            RISK SUMMARY
            ===================================================== */}
        <div className="device-risk-overview">
          <div className="device-risk-card">
            <div className="device-risk-card-icon">⚠</div>
            <div>
              <span>Device Risk Score</span>
              <strong>
                {riskScore}
                <small>/100</small>
              </strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon blue">◉</div>
            <div>
              <span>Associated Accounts</span>
              <strong>{accountsCount}</strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon purple">▤</div>
            <div>
              <span>Total Transactions</span>
              <strong>{transactionsCount}</strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon green">●</div>
            <div>
              <span>Current Status</span>
              <strong className={`device-summary-status ${String(status).toLowerCase()}`}>
                {status}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            DEVICE INFORMATION & SIGNALS
            ===================================================== */}
        <div className="device-details-grid">
          <section className="device-details-card">
            <div className="device-card-header">
              <div>
                <h2>Device Information</h2>
                <p>Registered device metadata and activity telemetry.</p>
              </div>
              <span>DEVICE</span>
            </div>

            <div className="device-info-grid">
              <div>
                <label>Device ID</label>
                <strong>{device.id}</strong>
              </div>

              <div>
                <label>Device Type</label>
                <strong>{device.type || "Android"}</strong>
              </div>

              <div>
                <label>Device Model</label>
                <strong>{device.model || "Mobile Client"}</strong>
              </div>

              <div>
                <label>Total Transacted</label>
                <strong>৳{Number(device.totalAmount || 0).toLocaleString()}</strong>
              </div>

              <div>
                <label>First Seen</label>
                <strong>{device.firstSeen || "Recorded in history"}</strong>
              </div>

              <div>
                <label>Last Activity</label>
                <strong>{device.lastActivity || device.lastTransactionAt || "Just now"}</strong>
              </div>
            </div>
          </section>

          {/* FEATURE 3: DEVICE RISK ASSESSMENT */}
          <section className="device-details-card">
            <div className="device-card-header">
              <div>
                <h2>Device Risk Assessment</h2>
                <p>Multi-account associations & suspicious device sharing telemetry.</p>
              </div>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background:
                    riskScore >= 70
                      ? "#fee2e2"
                      : riskScore >= 40
                      ? "#fef3c7"
                      : "#dcfce7",
                  color:
                    riskScore >= 70
                      ? "#b91c1c"
                      : riskScore >= 40
                      ? "#b45309"
                      : "#15803d",
                }}
              >
                {riskLevel.toUpperCase()} RISK
              </span>
            </div>

            {/* Sharing Highlight */}
            {accountsCount >= 2 && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: "12px",
                  borderRadius: "6px",
                  background: accountsCount >= 3 ? "#fff1f2" : "#fffbeb",
                  border: `1px solid ${accountsCount >= 3 ? "#fecdd3" : "#fef3c7"}`,
                  fontSize: "0.88rem",
                }}
              >
                <strong style={{ color: accountsCount >= 3 ? "#be123c" : "#b45309" }}>
                  ⚠ Device Sharing Alert:
                </strong>{" "}
                This device is associated with <strong>{accountsCount}</strong> distinct customer accounts{" "}
                and <strong>{device.suspiciousTransactions ?? 0}</strong> suspicious transactions.
              </div>
            )}

            <div className="device-risk-signals">
              {device.signals && device.signals.length > 0 ? (
                device.signals.map((sig: any, idx: number) => (
                  <div key={idx} className="device-risk-signal">
                    <span className={`device-signal-dot ${sig.severity || "high"}`} />
                    <div>
                      <h3>{sig.severity === "critical" ? "Critical Risk Factor" : "Risk Indicator"}</h3>
                      <p>{sig.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="device-risk-signal">
                  <span className="device-signal-dot low" />
                  <div>
                    <h3>Standard Operating Profile</h3>
                    <p>No abnormal device sharing or high-risk cluster patterns detected.</p>
                  </div>
                </div>
              )}

              {device.unavailable && device.unavailable.length > 0 && (
                <div style={{ marginTop: "12px", fontSize: "0.82rem", color: "#64748b" }}>
                  * {device.unavailable.join(" | ")}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =====================================================
            LINKED CUSTOMER ACCOUNTS
            ===================================================== */}
        <section className="device-details-card device-full-card">
          <div className="device-card-header">
            <div>
              <h2>Associated Customer Accounts</h2>
              <p>Real distinct customer accounts linked to this device in transaction history.</p>
            </div>
            <span>{accountsCount} ACCOUNTS</span>
          </div>

          <div className="device-customers-table-wrapper">
            <table className="device-customers-table">
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>RISK LEVEL</th>
                  <th>TRANSACTIONS</th>
                  <th>AVG AMOUNT</th>
                  <th>SUSPICIOUS TXNS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {linkedCustomers.length > 0 ? (
                  linkedCustomers.map((cust: any) => (
                    <tr key={cust.id}>
                      <td>
                        <Link href={`/customers/${cust.id}`} className="device-customer-id">
                          {cust.id}
                        </Link>
                      </td>

                      <td>
                        <span className={`device-risk-badge ${String(cust.riskLevel || "low").toLowerCase()}`}>
                          {cust.riskLevel}
                        </span>
                      </td>

                      <td>
                        <span className="device-customer-transactions">
                          {cust.transactions}
                        </span>
                      </td>

                      <td>৳{Number(cust.avgAmount || 0).toLocaleString()}</td>

                      <td>
                        <span style={{ color: cust.suspicious > 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                          {cust.suspicious}
                        </span>
                      </td>

                      <td>
                        <Link href={`/customers/${cust.id}`} className="device-view-link">
                          View Customer →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      No customer transactions recorded for this device.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            RECENT TRANSACTIONS
            ===================================================== */}
        <section className="device-details-card device-full-card">
          <div className="device-card-header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Real recent transactions originated from this device.</p>
            </div>
            <Link href={`/transactions?device=${device.id}`} className="device-view-all">
              View All →
            </Link>
          </div>

          <div className="device-customers-table-wrapper">
            <table className="device-customers-table">
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>CUSTOMER</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>RISK SCORE</th>
                  <th>STATUS</th>
                  <th>TIME</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length > 0 ? (
                  transactions.slice(0, 15).map((t: any) => (
                    <tr key={t.id}>
                      <td>
                        <Link href={`/transactions/${t.id}`} className="device-customer-id">
                          {t.id}
                        </Link>
                      </td>
                      <td>{t.customer}</td>
                      <td>{t.type}</td>
                      <td>
                        <strong className="device-transaction-amount">
                          ৳{Number(t.amount || 0).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`device-transaction-risk ${
                            t.score >= 80 ? "critical" : t.score >= 50 ? "high" : "medium"
                          }`}
                        >
                          {t.score}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`device-transaction-status ${String(t.level || "low").toLowerCase()}`}
                        >
                          {t.level}
                        </span>
                      </td>
                      <td>{t.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      No recent transactions recorded for this device.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
