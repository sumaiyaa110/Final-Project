"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { getDevices } from "@/services/api";

type Device = {
  id: string;
  type: string;
  model: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  accounts: number;
  transactions: number;
  lastActivity: string;
  status: "Active" | "Blocked" | "Inactive";
};

export default function DevicesPage() {
  const router = useRouter();

  // =========================================================
  // API DATA
  // =========================================================

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // =========================================================
  // FILTER STATES
  // =========================================================

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  // =========================================================
  // LOAD DEVICES FROM FASTAPI
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      try {
        const data = await getDevices();

        if (!mounted) return;

        if (!Array.isArray(data)) {
          throw new Error("Invalid device response");
        }

        setDevices(data);
        setApiError("");
      } catch (error) {
        console.error("Device API Error:", error);

        if (mounted) {
          setApiError("Unable to load device data from the server.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Initial load
    loadDevices();

    // Refresh every 5 seconds
    const interval = window.setInterval(() => {
      loadDevices();
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  // =========================================================
  // DYNAMIC SUMMARY VALUES
  // =========================================================

  const totalDevices = devices.length;

  const highRiskDevices = devices.filter(
    (device) => device.risk === "High" || device.risk === "Critical",
  ).length;

  const sharedDevices = devices.filter(
    (device) => device.accounts > 1,
  ).length;

  const activeDevices = devices.filter(
    (device) => device.status === "Active",
  ).length;

  // =========================================================
  // FILTER DEVICES
  // =========================================================

  const filteredDevices = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return devices.filter((device) => {
      const matchesSearch =
        searchValue === "" ||
        device.id.toLowerCase().includes(searchValue) ||
        device.type.toLowerCase().includes(searchValue) ||
        device.model.toLowerCase().includes(searchValue);

      const matchesRisk =
        riskFilter === "all" ||
        device.risk.toLowerCase() === riskFilter;

      const matchesStatus =
        statusFilter === "all" ||
        device.status.toLowerCase() === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        device.type.toLowerCase() === typeFilter;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    devices,
    search,
    riskFilter,
    statusFilter,
    typeFilter,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDevices.length / rowsPerPage),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedDevices = filteredDevices.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage,
  );

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setRiskFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
    setOpenMenu(null);
  };

  // =========================================================
  // ACTION HANDLERS
  // =========================================================

  const handleViewDevice = (deviceId: string) => {
    setOpenMenu(null);

    router.push(
      `/devices/${encodeURIComponent(deviceId)}`,
    );
  };

  const handleViewCustomers = (deviceId: string) => {
    setOpenMenu(null);

    router.push(
      `/customers?device=${encodeURIComponent(deviceId)}`,
    );
  };

  const handleViewTransactions = (deviceId: string) => {
    setOpenMenu(null);

    router.push(
      `/transactions?device=${encodeURIComponent(deviceId)}`,
    );
  };

  const handleInvestigateDevice = (deviceId: string) => {
    setOpenMenu(null);

    router.push(
      `/investigations?device=${encodeURIComponent(deviceId)}`,
    );
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <AdminLayout>
      <div
        className="devices-page"
        onClick={() => setOpenMenu(null)}
      >
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="devices-page-header">
          <div>
            <h1>Devices</h1>

            <p>
              Monitor registered devices, device risk and
              account associations.
            </p>
          </div>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="devices-summary-grid">
          <div className="devices-summary-card">
            <div className="devices-summary-top">
              <span>Total Devices</span>

              <div className="devices-summary-icon blue">
                ◉
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : totalDevices.toLocaleString()}
            </strong>

            <p>Registered devices</p>
          </div>

          <div className="devices-summary-card">
            <div className="devices-summary-top">
              <span>High Risk Devices</span>

              <div className="devices-summary-icon red">
                ⚠
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : highRiskDevices.toLocaleString()}
            </strong>

            <p>Require investigation</p>
          </div>

          <div className="devices-summary-card">
            <div className="devices-summary-top">
              <span>Shared Devices</span>

              <div className="devices-summary-icon orange">
                ◇
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : sharedDevices.toLocaleString()}
            </strong>

            <p>Linked to multiple accounts</p>
          </div>

          <div className="devices-summary-card">
            <div className="devices-summary-top">
              <span>Active Devices</span>

              <div className="devices-summary-icon green">
                ●
              </div>
            </div>

            <strong>
              {loading
                ? "..."
                : activeDevices.toLocaleString()}
            </strong>

            <p>Currently active</p>
          </div>
        </div>

        {/* =====================================================
            API ERROR
        ===================================================== */}

        {apiError && (
          <div className="devices-empty">
            {apiError}
          </div>
        )}

        {/* =====================================================
            FILTER BAR
        ===================================================== */}

        <div
          className="devices-filters"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="devices-search">
            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by device ID or model..."
            />
          </div>

          <select
            value={riskFilter}
            onChange={(event) => {
              setRiskFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="devices-select"
          >
            <option value="all">
              All Risk Levels
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="devices-select"
          >
            <option value="all">
              All Device Types
            </option>

            <option value="android">
              Android
            </option>

            <option value="ios">
              iOS
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="devices-select"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="blocked">
              Blocked
            </option>
          </select>

          <button
            type="button"
            className="devices-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        {/* =====================================================
            DEVICE TABLE
        ===================================================== */}

        <div
          className="devices-table-card"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="devices-table-header">
            <div>
              <h2>Device Records</h2>

              <p>
                Registered devices and their current risk
                activity.
              </p>
            </div>

            <span className="devices-result-count">
              {loading
                ? "Loading..."
                : `${filteredDevices.length.toLocaleString()} Results`}
            </span>
          </div>

          <div className="devices-table-wrapper">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>DEVICE ID</th>
                  <th>DEVICE</th>
                  <th>RISK LEVEL</th>
                  <th>ASSOCIATED ACCOUNTS</th>
                  <th>TRANSACTIONS</th>
                  <th>LAST ACTIVITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="devices-empty"
                    >
                      Loading devices...
                    </td>
                  </tr>
                ) : paginatedDevices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="devices-empty"
                    >
                      No devices found.
                    </td>
                  </tr>
                ) : (
                  paginatedDevices.map((device) => (
                    <tr key={device.id}>
                      {/* DEVICE ID */}

                      <td>
                        <button
                          type="button"
                          className="device-id-link"
                          onClick={() =>
                            handleViewDevice(device.id)
                          }
                        >
                          {device.id}
                        </button>
                      </td>

                      {/* DEVICE */}

                      <td>
                        <div className="device-table-device">
                          <div className="device-table-icon">
                            {device.type.toLowerCase() ===
                            "ios"
                              ? ""
                              : "▣"}
                          </div>

                          <div>
                            <strong>
                              {device.model}
                            </strong>

                            <span>
                              {device.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* RISK */}

                      <td>
                        <span
                          className={`device-risk-badge ${device.risk.toLowerCase()}`}
                        >
                          {device.risk}
                        </span>
                      </td>

                      {/* ASSOCIATED ACCOUNTS */}

                      <td>
                        <div className="device-account-count">
                          <strong>
                            {device.accounts}
                          </strong>

                          <span>
                            {device.accounts === 1
                              ? "account"
                              : "accounts"}
                          </span>
                        </div>
                      </td>

                      {/* TRANSACTIONS */}

                      <td>
                        <span className="device-transaction-count">
                          {device.transactions}
                        </span>
                      </td>

                      {/* LAST ACTIVITY */}

                      <td>
                        <span className="device-last-activity">
                          {device.lastActivity}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`device-status ${device.status.toLowerCase()}`}
                        >
                          <span className="device-status-dot" />

                          {device.status}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="device-actions-cell">
                        <div className="device-action-wrapper">
                          <button
                            type="button"
                            className="device-action-button"
                            aria-label={`Actions for ${device.id}`}
                            aria-expanded={
                              openMenu === device.id
                            }
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              setOpenMenu(
                                (current) =>
                                  current === device.id
                                    ? null
                                    : device.id,
                              );
                            }}
                          >
                            •••
                          </button>

                          {openMenu === device.id && (
                            <div
                              className="device-action-menu"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDevice(
                                    device.id,
                                  )
                                }
                              >
                                View Device
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewCustomers(
                                    device.id,
                                  )
                                }
                              >
                                View Customers
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewTransactions(
                                    device.id,
                                  )
                                }
                              >
                                View Transactions
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleInvestigateDevice(
                                    device.id,
                                  )
                                }
                              >
                                Investigate Device
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              PAGINATION
          =================================================== */}

          <div className="devices-pagination">
            <span className="devices-pagination-info">
              Showing{" "}
              <strong>
                {filteredDevices.length === 0
                  ? 0
                  : (safeCurrentPage - 1) *
                      rowsPerPage +
                    1}
              </strong>
              {"–"}
              <strong>
                {Math.min(
                  safeCurrentPage * rowsPerPage,
                  filteredDevices.length,
                )}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredDevices.length}
              </strong>{" "}
              devices
            </span>

            <div className="devices-pagination-controls">
              <button
                type="button"
                className="devices-pagination-button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1),
                  )
                }
              >
                ←
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`devices-pagination-button ${
                    safeCurrentPage === page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="devices-pagination-button"
                disabled={
                  safeCurrentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1,
                    ),
                  )
                }
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}