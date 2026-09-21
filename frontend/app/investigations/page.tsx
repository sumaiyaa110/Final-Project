"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import AdminLayout from "@/components/layout/AdminLayout";

import { getDevices, getInvestigations } from "@/services/api";

// =====================================================
// TYPES
// =====================================================

type DeviceRisk = "Critical" | "High" | "Medium" | "Low";

type DeviceStatus = "Active" | "Inactive" | "Blocked";

type Device = {
  id: string;
  type: string;
  model: string;
  risk: DeviceRisk;
  status: DeviceStatus;
  accounts: number;
  transactions: number;
  lastActivity: string;
};

type Transaction = {
  id: string;
  customer: string;
  type: string;
  amount: number | string;
  score: number;
  level: DeviceRisk;
  status: string;
  time: string;
  device: string;
};

type InvestigationStatus = "Open" | "Investigating" | "Escalated" | "Resolved";

type Investigation = {
  id: string;
  device: string;
  risk: DeviceRisk;
  accounts: number;
  transactions: number;
  status: InvestigationStatus;
  updated: string;
};

// =====================================================
// PAGE
// =====================================================

export default function InvestigationsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  // =====================================================
  // SELECTED DEVICE FROM URL
  // =====================================================

  const deviceId = searchParams.get("device");

  // =====================================================
  // LIVE DATA STATE
  // =====================================================

  const [devices, setDevices] = useState<Device[]>([]);

  const [deviceTransactions, setDeviceTransactions] = useState<Transaction[]>(
    [],
  );

  const [investigations, setInvestigations] = useState<Investigation[]>([]);

  const [device, setDevice] = useState<Device | null>(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FILTER STATES
  // =====================================================

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] = useState("All Risk Levels");

  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // =====================================================
  // REALTIME FETCH
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        // -------------------------------------------------
        // Load investigations
        // -------------------------------------------------

        const investigationData = await getInvestigations();

        if (!cancelled) {
          setInvestigations(investigationData);
        }

        // -------------------------------------------------
        // DEVICE SELECTED
        // -------------------------------------------------

        if (deviceId) {
          console.log("Loading device:", deviceId);

          // ===============================================
          // Load device details
          // ===============================================

          const deviceResponse = await fetch(
            `http://localhost:8000/device/${encodeURIComponent(deviceId)}`,
            {
              cache: "no-store",
            },
          );

          if (!deviceResponse.ok) {
            throw new Error(`Device API failed: ${deviceResponse.status}`);
          }

          const deviceData = await deviceResponse.json();

          console.log("Device Detail Response:", deviceData);

          if (deviceData.success && deviceData.device) {
            if (!cancelled) {
              setDevice(deviceData.device);
            }
          } else {
            if (!cancelled) {
              setDevice(null);
            }
          }

          // ===============================================
          // Load transactions for this device
          // ===============================================

          const transactionResponse = await fetch(
            `http://localhost:8000/device/${encodeURIComponent(
              deviceId,
            )}/transactions`,
            {
              cache: "no-store",
            },
          );

          if (!transactionResponse.ok) {
            throw new Error(
              `Device transaction API failed: ${transactionResponse.status}`,
            );
          }

          const transactionData = await transactionResponse.json();

          console.log("Device Transactions:", transactionData);

          if (
            transactionData.success &&
            Array.isArray(transactionData.transactions)
          ) {
            if (!cancelled) {
              setDeviceTransactions(transactionData.transactions);
            }
          } else {
            if (!cancelled) {
              setDeviceTransactions([]);
            }
          }
        } else {
          // -------------------------------------------------
          // NO DEVICE SELECTED
          // Load all devices for investigation list
          // -------------------------------------------------

          const deviceData = await getDevices();

          if (!cancelled) {
            setDevices(deviceData);

            setDevice(null);

            setDeviceTransactions([]);
          }
        }
      } catch (error) {
        console.log("Investigation API Error:", error);

        if (!cancelled) {
          if (deviceId) {
            setDevice(null);

            setDeviceTransactions([]);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Reset loading when device changes

    setLoading(true);

    loadData();

    // Refresh every 5 seconds

    const interval = setInterval(loadData, 5000);

    return () => {
      cancelled = true;

      clearInterval(interval);
    };
  }, [deviceId]);

  // =====================================================
  // FILTER INVESTIGATIONS
  // =====================================================

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((item) => {
      const value = search.toLowerCase().trim();

      const matchSearch =
        item.id.toLowerCase().includes(value) ||
        item.device.toLowerCase().includes(value);

      const matchRisk =
        riskFilter === "All Risk Levels" || item.risk === riskFilter;

      const matchStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      return matchSearch && matchRisk && matchStatus;
    });
  }, [investigations, search, riskFilter, statusFilter]);

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");

    setRiskFilter("All Risk Levels");

    setStatusFilter("All Statuses");
  };

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  const formatAmount = (amount: number | string) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount;
    }

    return `৳${numericAmount.toLocaleString("en-BD")}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (value: string) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =====================================================
  // NO DEVICE SELECTED
  // =====================================================

  if (!deviceId) {
    const openCases = investigations.filter(
      (item) => item.status === "Open",
    ).length;

    const investigatingCases = investigations.filter(
      (item) => item.status === "Investigating",
    ).length;

    const escalatedCases = investigations.filter(
      (item) => item.status === "Escalated",
    ).length;

    const resolvedCases = investigations.filter(
      (item) => item.status === "Resolved",
    ).length;

    return (
      <AdminLayout>
        <div className="investigations-page">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="investigations-page-header">
            <div>
              <h1>Investigations</h1>

              <p>Review and manage suspicious activity investigations.</p>
            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="investigations-summary-grid">
            <div className="investigation-summary-card">
              <span>Open Cases</span>

              <strong>{openCases}</strong>
            </div>

            <div className="investigation-summary-card">
              <span>Investigating</span>

              <strong>{investigatingCases}</strong>
            </div>

            <div className="investigation-summary-card">
              <span>Escalated</span>

              <strong>{escalatedCases}</strong>
            </div>

            <div className="investigation-summary-card">
              <span>Resolved</span>

              <strong>{resolvedCases}</strong>
            </div>
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="investigations-filter-card">
            <div className="investigations-search">
              <span>⌕</span>

              <input
                placeholder="Search investigation or device..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option>All Risk Levels</option>

              <option>Critical</option>

              <option>High</option>

              <option>Medium</option>

              <option>Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>

              <option>Open</option>

              <option>Investigating</option>

              <option>Escalated</option>

              <option>Resolved</option>
            </select>

            <button className="investigations-reset" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {/* =================================================
              INVESTIGATION TABLE
          ================================================= */}

          <div className="investigations-table-card">
            <div className="investigations-table-header">
              <div>
                <h2>Investigation Cases</h2>

                <p>Active and recently reviewed fraud investigations.</p>
              </div>
            </div>

            <div className="investigations-table-wrapper">
              <table className="investigations-table">
                <thead>
                  <tr>
                    <th>INVESTIGATION</th>

                    <th>DEVICE</th>

                    <th>RISK</th>

                    <th>ACCOUNTS</th>

                    <th>TRANSACTIONS</th>

                    <th>STATUS</th>

                    <th>UPDATED</th>

                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="investigations-empty">
                        Loading investigations...
                      </td>
                    </tr>
                  ) : filteredInvestigations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="investigations-empty">
                        No investigations found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvestigations.map((item) => (
                      <tr key={item.id}>
                        <td className="investigation-id">{item.id}</td>

                        <td className="investigation-entity">{item.device}</td>

                        <td>
                          <span
                            className={`investigation-risk ${item.risk.toLowerCase()}`}
                          >
                            {item.risk}
                          </span>
                        </td>

                        <td>{item.accounts}</td>

                        <td>{item.transactions}</td>

                        <td>
                          <span
                            className={`investigation-status ${item.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="investigation-updated">
                          {item.updated}
                        </td>

                        <td>
                          <button
                            className="investigation-view-button"
                            onClick={() =>
                              router.push(
                                `/investigations?device=${encodeURIComponent(
                                  item.device,
                                )}`,
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="investigations-pagination">
              <span>
                Showing {filteredInvestigations.length} investigations
              </span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // =====================================================
  // DEVICE SELECTED VIEW
  // =====================================================

  return (
    <AdminLayout>
      <div className="investigations-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="investigations-page-header">
          <div>
            <h1>Device Investigation</h1>

            <p>Detailed analysis of suspicious device activity.</p>
          </div>

          <button
            className="investigation-back-button"
            onClick={() => router.push("/investigations")}
          >
            ← Back
          </button>
        </div>

        {/* =================================================
            DEVICE CONTENT
        ================================================= */}

        {loading ? (
          <div className="investigation-loading">
            Loading device information...
          </div>
        ) : device ? (
          <>
            {/* =================================================
                DEVICE SUMMARY
            ================================================= */}

            <div className="device-investigation-summary">
              {/* =================================================
                  DEVICE INFORMATION
              ================================================= */}

            <div className="device-info-card">

              <h3>
                Device Information
              </h3>


              <div className="device-info-grid">


                <div className="device-info-item">
                  <span>
                    Device ID
                  </span>

                  <strong>
                    {device.id}
                  </strong>
                </div>



                <div className="device-info-item">
                  <span>
                    Type
                  </span>

                  <strong>
                    {device.type}
                  </strong>
                </div>



                <div className="device-info-item">
                  <span>
                    Model
                  </span>

                  <strong>
                    {device.model}
                  </strong>
                </div>



                <div className="device-info-item">
                  <span>
                    Status
                  </span>

                  <strong>
                    {device.status}
                  </strong>
                </div>


              </div>

            </div>

              {/* =================================================
                  RISK ASSESSMENT
              ================================================= */}

              <div className="device-risk-card">
                <h3>Risk Assessment</h3>

                <div className="device-risk-value">
                  <span
                    className={`investigation-risk ${device.risk.toLowerCase()}`}
                  >
                    {device.risk}
                  </span>
                </div>

                <div className="device-info-row">
                  <span>Linked Accounts</span>

                  <strong>{device.accounts}</strong>
                </div>

                <div className="device-info-row">
                  <span>Transactions</span>

                  <strong>{device.transactions}</strong>
                </div>

                <div className="device-info-row">
                  <span>Last Activity</span>

                  <strong title={device.lastActivity}>
                    {formatDateTime(device.lastActivity)}
                  </strong>
                </div>
              </div>
            </div>

            {/* =================================================
                RELATED TRANSACTIONS
            ================================================= */}

            <div className="investigations-table-card">
              <div className="investigations-table-header">
                <div>
                  <h2>Related Transactions</h2>

                  <p>Recent transactions connected with this device.</p>
                </div>

                <div
                  style={{
                    color: "#7187a3",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {deviceTransactions.length} transaction
                  {deviceTransactions.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="investigations-table-wrapper">
                <table className="investigations-table">
                  <thead>
                    <tr>
                      <th>TXN ID</th>

                      <th>TYPE</th>

                      <th>AMOUNT</th>

                      <th>RISK SCORE</th>

                      <th>LEVEL</th>

                      <th>CUSTOMER</th>

                      <th>TIME</th>
                    </tr>
                  </thead>

                  <tbody>
                    {deviceTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="investigations-empty">
                          No transactions available for this device.
                        </td>
                      </tr>
                    ) : (
                      deviceTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="transaction-id">{transaction.id}</td>

                          <td>{transaction.type}</td>

                          <td>{formatAmount(transaction.amount)}</td>

                          <td>
                            <div className="transaction-risk">
                              <div className="transaction-risk-bar">
                                <span
                                  style={{
                                    width: `${Math.min(
                                      Math.max(transaction.score, 0),
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>

                              <strong>{transaction.score}</strong>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`investigation-risk ${transaction.level.toLowerCase()}`}
                            >
                              {transaction.level}
                            </span>
                          </td>

                          <td>{transaction.customer}</td>

                          <td title={transaction.time}>
                            {formatDateTime(transaction.time)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="investigations-empty">Device not found.</div>
        )}
      </div>
    </AdminLayout>
  );
}
