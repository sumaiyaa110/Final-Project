"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";

type DeviceData = {
  id: string;
  type: "Android" | "iOS";
  model: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  riskScore: number;
  status: "Active" | "Blocked" | "Inactive";
  accounts: number;
  transactions: number;
  firstSeen: string;
  lastActivity: string;
  location: string;
};

const devices: DeviceData[] = [
  {
    id: "DEV-77891",
    type: "Android",
    model: "Samsung Galaxy A54",
    risk: "High",
    riskScore: 87,
    status: "Active",
    accounts: 4,
    transactions: 23,
    firstSeen: "January 2025",
    lastActivity: "2 min ago",
    location: "Dhaka",
  },
  {
    id: "DEV-66543",
    type: "Android",
    model: "Xiaomi Redmi Note 12",
    risk: "High",
    riskScore: 82,
    status: "Active",
    accounts: 3,
    transactions: 18,
    firstSeen: "March 2025",
    lastActivity: "8 min ago",
    location: "Dhaka",
  },
  {
    id: "DEV-99211",
    type: "iOS",
    model: "iPhone 13",
    risk: "Medium",
    riskScore: 64,
    status: "Active",
    accounts: 2,
    transactions: 31,
    firstSeen: "February 2025",
    lastActivity: "14 min ago",
    location: "Chattogram",
  },
  {
    id: "DEV-44321",
    type: "Android",
    model: "Samsung Galaxy M33",
    risk: "High",
    riskScore: 79,
    status: "Active",
    accounts: 5,
    transactions: 42,
    firstSeen: "December 2024",
    lastActivity: "21 min ago",
    location: "Dhaka",
  },
  {
    id: "DEV-77122",
    type: "Android",
    model: "Realme 11 Pro",
    risk: "Medium",
    riskScore: 58,
    status: "Active",
    accounts: 2,
    transactions: 16,
    firstSeen: "April 2025",
    lastActivity: "35 min ago",
    location: "Sylhet",
  },
  {
    id: "DEV-33411",
    type: "Android",
    model: "Vivo Y36",
    risk: "Medium",
    riskScore: 61,
    status: "Active",
    accounts: 2,
    transactions: 27,
    firstSeen: "May 2025",
    lastActivity: "1 hour ago",
    location: "Dhaka",
  },
  {
    id: "DEV-88776",
    type: "Android",
    model: "Oppo Reno 8",
    risk: "Low",
    riskScore: 24,
    status: "Active",
    accounts: 1,
    transactions: 14,
    firstSeen: "June 2025",
    lastActivity: "2 hours ago",
    location: "Rajshahi",
  },
  {
    id: "DEV-10022",
    type: "iOS",
    model: "iPhone 12",
    risk: "Low",
    riskScore: 18,
    status: "Active",
    accounts: 1,
    transactions: 9,
    firstSeen: "July 2025",
    lastActivity: "3 hours ago",
    location: "Dhaka",
  },
  {
    id: "DEV-55110",
    type: "Android",
    model: "Samsung Galaxy A24",
    risk: "Low",
    riskScore: 15,
    status: "Inactive",
    accounts: 1,
    transactions: 7,
    firstSeen: "August 2025",
    lastActivity: "5 hours ago",
    location: "Khulna",
  },
  {
    id: "DEV-33221",
    type: "Android",
    model: "Tecno Camon 20",
    risk: "Critical",
    riskScore: 96,
    status: "Blocked",
    accounts: 6,
    transactions: 57,
    firstSeen: "November 2024",
    lastActivity: "12 min ago",
    location: "Dhaka",
  },
];

const recentTransactions = [
  {
    id: "TXN-92831",
    customer: "CUST0012",
    type: "Cash Out",
    amount: "৳85,000",
    risk: 98,
    status: "Investigate",
    time: "2 min ago",
  },
  {
    id: "TXN-92784",
    customer: "CUST0492",
    type: "Transfer",
    amount: "৳42,500",
    risk: 94,
    status: "Review",
    time: "8 min ago",
  },
  {
    id: "TXN-92691",
    customer: "CUST0781",
    type: "Cash Out",
    amount: "৳31,200",
    risk: 91,
    status: "Review",
    time: "14 min ago",
  },
  {
    id: "TXN-92577",
    customer: "CUST0034",
    type: "Payment",
    amount: "৳18,750",
    risk: 87,
    status: "Review",
    time: "21 min ago",
  },
  {
    id: "TXN-92463",
    customer: "CUST0567",
    type: "Transfer",
    amount: "৳12,400",
    risk: 84,
    status: "Monitoring",
    time: "35 min ago",
  },
];

const associatedCustomers = [
  {
    id: "CUST0012",
    name: "Tanvir Ahmed",
    risk: "High",
    transactions: 248,
  },
  {
    id: "CUST0492",
    name: "Sadia Rahman",
    risk: "High",
    transactions: 126,
  },
  {
    id: "CUST0781",
    name: "Mehedi Hasan",
    risk: "Medium",
    transactions: 89,
  },
  {
    id: "CUST0987",
    name: "Tariqul Islam",
    risk: "High",
    transactions: 201,
  },
];

export default function DeviceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const deviceId = typeof params?.id === "string" ? params.id : "";

  const device = devices.find((item) => item.id === deviceId);

  if (!device) {
    return (
      <AdminLayout>
        <div className="device-details-not-found">
          <div className="device-not-found-icon">!</div>

          <h1>Device Not Found</h1>

          <p>
            The device <strong>{deviceId}</strong> could not be found.
          </p>

          <button type="button" onClick={() => router.push("/devices")}>
            ← Back to Devices
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="device-details-page">
        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="device-details-header">
          <div>
            <button
              type="button"
              className="device-back-button"
              onClick={() => router.push("/devices")}
            >
              ← Back to Devices
            </button>

            <div className="device-title-row">
              <div className="device-large-icon">
                {device.type === "iOS" ? "" : "▣"}
              </div>

              <div>
                <div className="device-heading-line">
                  <h1>{device.id}</h1>

                  <span
                    className={`device-risk-badge-large ${device.risk.toLowerCase()}`}
                  >
                    {device.risk}
                  </span>
                </div>

                <p>
                  {device.model} · {device.type}
                </p>
              </div>
            </div>
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
                {device.riskScore}
                <small>/100</small>
              </strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon blue">◉</div>

            <div>
              <span>Associated Accounts</span>

              <strong>{device.accounts}</strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon purple">▤</div>

            <div>
              <span>Total Transactions</span>

              <strong>{device.transactions}</strong>
            </div>
          </div>

          <div className="device-risk-card">
            <div className="device-risk-card-icon green">●</div>

            <div>
              <span>Current Status</span>

              <strong
                className={`device-summary-status ${device.status.toLowerCase()}`}
              >
                {device.status}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            DEVICE INFORMATION
            ===================================================== */}

        <div className="device-details-grid">
          <section className="device-details-card">
            <div className="device-card-header">
              <div>
                <h2>Device Information</h2>

                <p>Registered device information and activity metadata.</p>
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

                <strong>{device.type}</strong>
              </div>

              <div>
                <label>Device Model</label>

                <strong>{device.model}</strong>
              </div>

              <div>
                <label>Location</label>

                <strong>{device.location}</strong>
              </div>

              <div>
                <label>First Seen</label>

                <strong>{device.firstSeen}</strong>
              </div>

              <div>
                <label>Last Activity</label>

                <strong>{device.lastActivity}</strong>
              </div>
            </div>
          </section>

          {/* ===================================================
              AI DEVICE RISK
              =================================================== */}

          <section className="device-details-card">
            <div className="device-card-header">
              <div>
                <h2>Device Risk Analysis</h2>

                <p>Detected device-related risk signals.</p>
              </div>

              <span>AI</span>
            </div>

            <div className="device-risk-signals">
              <div className="device-risk-signal">
                <span className="device-signal-dot high" />

                <div>
                  <h3>Multiple Account Association</h3>

                  <p>
                    This device is associated with {device.accounts} customer
                    accounts.
                  </p>
                </div>
              </div>

              <div className="device-risk-signal">
                <span className="device-signal-dot medium" />

                <div>
                  <h3>Transaction Activity</h3>

                  <p>
                    {device.transactions} recent transactions were detected from
                    this device.
                  </p>
                </div>
              </div>

              <div className="device-risk-signal">
                <span className="device-signal-dot high" />

                <div>
                  <h3>Device Risk Assessment</h3>

                  <p>Current device risk score is {device.riskScore}/100.</p>
                </div>
              </div>
            </div>

            <div className="device-ai-note">
              <span>✦</span>

              <div>
                <strong>AI Insight</strong>

                <p>
                  Device behavior should be reviewed against associated customer
                  activity.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            ASSOCIATED CUSTOMERS
            ===================================================== */}

        <section className="device-details-card device-full-card">
          <div className="device-card-header">
            <div>
              <h2>Associated Customers</h2>

              <p>Customer accounts linked to this device.</p>
            </div>

            <span>{device.accounts} ACCOUNTS</span>
          </div>

          <div className="device-customers-table-wrapper">
            <table className="device-customers-table">
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>

                  <th>NAME</th>

                  <th>RISK LEVEL</th>

                  <th>TRANSACTIONS</th>

                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {associatedCustomers
                  .slice(
                    0,
                    Math.min(device.accounts, associatedCustomers.length),
                  )
                  .map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="device-customer-id"
                        >
                          {customer.id}
                        </Link>
                      </td>

                      <td>
                        <span className="device-customer-name">
                          {customer.name}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`device-risk-badge ${customer.risk.toLowerCase()}`}
                        >
                          {customer.risk}
                        </span>
                      </td>

                      <td>
                        <span className="device-customer-transactions">
                          {customer.transactions}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="device-view-link"
                        >
                          View Customer →
                        </Link>
                      </td>
                    </tr>
                  ))}
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

              <p>Recent transaction activity from this device.</p>
            </div>

            <Link
              href={`/transactions?device=${device.id}`}
              className="device-view-all"
            >
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
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <Link
                        href={`/transactions/${transaction.id}`}
                        className="device-customer-id"
                      >
                        {transaction.id}
                      </Link>
                    </td>

                    <td>{transaction.customer}</td>

                    <td>{transaction.type}</td>

                    <td>
                      <strong className="device-transaction-amount">
                        {transaction.amount}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`device-transaction-risk ${
                          transaction.risk >= 85
                            ? "critical"
                            : transaction.risk >= 60
                              ? "high"
                              : "medium"
                        }`}
                      >
                        {transaction.risk}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`device-transaction-status ${transaction.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td>{transaction.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
