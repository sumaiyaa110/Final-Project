import Link from "next/link";
import {
  LuActivity,
  LuArrowLeftRight,
  LuBell,
  LuFileText,
  LuLayoutDashboard,
  LuLock,
  LuSearch,
  LuShare2,
  LuShieldAlert,
  LuSmartphone,
  LuTriangleAlert,
  LuUserCheck,
  LuUsers,
} from "react-icons/lu";
import ThemeToggle from "@/components/ui/ThemeToggle";

function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">A</div>
      <span>
        Anomaly<span className="logo-x">X</span>
      </span>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      {/* Top Bar */}
      <div className="preview-topbar">
        <div className="preview-brand">
          <div className="mini-logo">A</div>
          <span>AnomalyX</span>
        </div>

        <div className="preview-search">
          <LuSearch aria-hidden="true" />
          Search transactions, customers, devices...
        </div>

        <div className="preview-admin">
          <LuBell aria-hidden="true" />
          <div className="admin-avatar">A</div>
          <span>Admin</span>
          <span>⌄</span>
        </div>
      </div>

      {/* Dashboard */}
      <div className="preview-main">
        {/* Sidebar */}
        <aside className="preview-sidebar">
          <div className="preview-nav active">
            <span><LuLayoutDashboard aria-hidden="true" /></span>
            Dashboard
          </div>

          <div className="preview-nav">
            <span><LuArrowLeftRight aria-hidden="true" /></span>
            Transactions
          </div>

          <div className="preview-nav">
            <span><LuTriangleAlert aria-hidden="true" /></span>
            Fraud Alerts
          </div>

          <div className="preview-nav">
            <span><LuUsers aria-hidden="true" /></span>
            Customers
          </div>

          <div className="preview-nav">
            <span><LuSmartphone aria-hidden="true" /></span>
            Devices
          </div>

          <div className="preview-nav">
            <span><LuUserCheck aria-hidden="true" /></span>
            Agents
          </div>

          <div className="preview-nav">
            <span><LuShare2 aria-hidden="true" /></span>
            Network
          </div>

          <div className="preview-nav">
            <span><LuFileText aria-hidden="true" /></span>
            Reports
          </div>
        </aside>

        {/* Content */}
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <h3>Dashboard</h3>
              <p>Real-time overview of system activity</p>
            </div>

            <div className="date-filter">Last 7 Days ▾</div>
          </div>

          {/* KPI */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span>Total Transactions</span>
              <strong>392,386</strong>
              <small className="green">↗ 12.4%</small>
            </div>

            <div className="kpi-card">
              <span>Fraud Alerts</span>
              <strong>1,177</strong>
              <small className="red">↗ 5.8%</small>
            </div>

            <div className="kpi-card">
              <span>High Risk</span>
              <strong>423</strong>
              <small className="yellow">↗ 3.1%</small>
            </div>

            <div className="kpi-card">
              <span>Fraud Rate</span>
              <strong>0.30%</strong>
              <small className="green">↘ 0.2%</small>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="preview-card transaction-chart">
              <div className="card-header">
                <span>Transaction Trend</span>
                <span className="card-filter">Last 7 Days ▾</span>
              </div>

              <div className="chart-area">
                <div className="chart-grid-lines"></div>

                <svg
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  className="line-chart"
                >
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#3566b6" />
                      <stop offset="100%" stopColor="#3566b6" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 145
                       C50 120 70 140 110 115
                       C150 90 175 125 215 100
                       C255 75 280 110 315 90
                       C350 65 375 90 410 55
                       C450 25 470 70 510 45
                       C545 25 565 45 600 15"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="chart-labels">
                <span>Sep 1</span>
                <span>Sep 2</span>
                <span>Sep 3</span>
                <span>Sep 4</span>
                <span>Sep 5</span>
                <span>Sep 6</span>
                <span>Sep 7</span>
              </div>
            </div>

            {/* Channel Chart */}
            <div className="preview-card channel-chart">
              <div className="card-header">
                <span>Transactions by Channel</span>
              </div>

              <div className="channel-body">
                <div className="donut-chart">
                  <div className="donut-center">392K</div>
                </div>

                <div className="channel-list">
                  <div>
                    <span className="channel-dot blue"></span>
                    P2P
                    <b>42%</b>
                  </div>

                  <div>
                    <span className="channel-dot purple"></span>
                    Cash In
                    <b>24%</b>
                  </div>

                  <div>
                    <span className="channel-dot pink"></span>
                    Cash Out
                    <b>18%</b>
                  </div>

                  <div>
                    <span className="channel-dot cyan"></span>
                    Bill Payment
                    <b>10%</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="preview-card recent-transactions">
            <div className="card-header">
              <span>Recent High-Risk Transactions</span>

              <span className="view-all">View All →</span>
            </div>

            <div className="transaction-table">
              <div className="table-row table-header">
                <span>TXN ID</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Channel</span>
                <span>Risk</span>
              </div>

              <div className="table-row">
                <span>TX001234</span>
                <span>CUST0012</span>
                <span>৳45,000</span>
                <span>P2P</span>
                <span className="high-risk">HIGH</span>
              </div>

              <div className="table-row">
                <span>TX001235</span>
                <span>CUST0492</span>
                <span>৳18,200</span>
                <span>Cash Out</span>
                <span className="high-risk">HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="home-page">
      {/* Navigation */}
      <nav className="home-nav">
        <Logo />

        <div className="home-nav-actions">
          <div className="admin-access">
            <LuLock aria-hidden="true" />
            Admin access only
          </div>

          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <span></span>
            Monitor. Detect. Prevent.
          </div>

          <h1>
            A Safer Financial
            <br />
            Ecosystem with
            <br />
            <span>AnomalyX</span>
          </h1>

          <p>
            An AI-powered fraud monitoring system for Mobile Financial Services,
            designed for administrators to detect suspicious activities,
            investigate risks, and ensure a secure financial ecosystem.
          </p>

          <Link href="/login" className="login-button">
            Log in to dashboard
            <span>→</span>
          </Link>

          <div className="access-note">
            <LuLock aria-hidden="true" />
            This system is accessible only to authorized administrators.
          </div>
        </div>

        {/* Dashboard */}
        <div className="hero-dashboard">
          <DashboardPreview />
        </div>
      </section>

      {/* Capabilities */}
      <section className="capabilities">
        <div className="section-heading">
          <span>Capabilities</span>

          <h2>
            Everything an <strong>Admin</strong> Needs
          </h2>

          <p>
            Powerful tools to monitor, investigate, and prevent financial fraud.
          </p>
        </div>

        <div className="capability-grid">
          <div className="capability-card">
            <div className="capability-icon purple"><LuActivity aria-hidden="true" /></div>

            <h3>Real-time Monitoring</h3>

            <p>
              Track transactions, customers, devices and agents in real-time.
            </p>
          </div>

          <div className="capability-card">
            <div className="capability-icon red"><LuShieldAlert aria-hidden="true" /></div>

            <h3>Fraud Detection</h3>

            <p>Identify suspicious patterns using advanced AI/ML models.</p>
          </div>

          <div className="capability-card">
            <div className="capability-icon green"><LuShare2 aria-hidden="true" /></div>

            <h3>Network Analysis</h3>

            <p>Uncover hidden relationships and suspicious fraud rings.</p>
          </div>

          <div className="capability-card">
            <div className="capability-icon blue"><LuFileText aria-hidden="true" /></div>

            <h3>Actionable Insights</h3>

            <p>
              Get clear explanations and investigation support for suspicious
              activity.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <Logo />

        <p>Securing Mobile Financial Services for a Better Tomorrow.</p>

        <div className="footer-items">
          <span>Private & secure</span>
          <span>Admin only</span>
          <span>Data-driven decisions</span>
        </div>
      </footer>
    </main>
  );
}
