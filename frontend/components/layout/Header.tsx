"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getDashboardData } from "@/services/api";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [fraudAlerts, setFraudAlerts] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  const previousAlertsRef = useRef(0);

  const router = useRouter();

  // ==========================================
  // LIVE FRAUD ALERT COUNT
  // ==========================================

  useEffect(() => {
    async function loadFraudAlerts() {
      try {
        const data = await getDashboardData();

        const currentAlerts = Number(data.fraud_alerts) || 0;

        setFraudAlerts(currentAlerts);

        // Detect increase in fraud alerts
        if (
          previousAlertsRef.current !== 0 &&
          currentAlerts > previousAlertsRef.current
        ) {
          setHasNewAlert(true);

          setTimeout(() => {
            setHasNewAlert(false);
          }, 1000);
        }

        previousAlertsRef.current = currentAlerts;
      } catch (error) {
        console.log("Notification API Error:", error);
      }
    }

    // First load
    loadFraudAlerts();

    // Refresh every 5 seconds
    const interval = setInterval(loadFraudAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  // ==========================================
  // PROFILE
  // ==========================================

  function handleProfile() {
    setShowMenu(false);
    router.push("/profile");
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  function handleSettings() {
    setShowMenu(false);
    router.push("/settings");
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  function handleNotifications() {
    setShowNotifications(!showNotifications);
    setShowMenu(false);
  }

  function handleViewAlerts() {
    setShowNotifications(false);
    router.push("/alerts");
  }

  return (
    <header className="admin-header">
      <div className="header-actions">
        {/* =====================================
            SYSTEM STATUS
        ====================================== */}
        <div className="header-status">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>

        {/* =====================================
            NOTIFICATIONS
        ====================================== */}
        <div className="notification-container">
          <button
            className={`header-icon-button ${
              hasNewAlert ? "notification-new" : ""
            }`}
            aria-label={`Fraud alerts: ${fraudAlerts}`}
            onClick={handleNotifications}
          >
            ♢<span className="notification-badge">{fraudAlerts}</span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-panel">
              {/* Header */}
              <div className="notification-panel-header">
                <div>
                  <h3>Fraud Alerts</h3>
                  <p>Live monitoring notifications</p>
                </div>

                <span className="notification-count">{fraudAlerts}</span>
              </div>

              {/* Notification Content */}
              <div className="notification-panel-body">
                <div className="notification-alert-icon">⚠</div>

                <div className="notification-alert-content">
                  <h4>High-Risk Alerts</h4>

                  <p>
                    You currently have <strong>{fraudAlerts}</strong> high-risk
                    or critical transactions requiring monitoring.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <button
                className="notification-view-button"
                onClick={handleViewAlerts}
              >
                View all fraud alerts
                <span>→</span>
              </button>
            </div>
          )}
        </div>

        {/* =====================================
            ADMIN PROFILE
        ====================================== */}
        <div className="profile-container">
          <button
            className="admin-profile"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="admin-avatar">A</div>

            <div className="admin-info">
              <span className="admin-name">Administrator</span>

              <span className="admin-role">System Admin</span>
            </div>

            <span className="profile-arrow">▾</span>
          </button>

          {/* =================================
              PROFILE DROPDOWN
          ================================== */}
          {showMenu && (
            <div className="profile-menu">
              {/* My Profile */}
              <button onClick={handleProfile}>My Profile</button>

              {/* Settings */}
              <button onClick={handleSettings}>Settings</button>

              <div className="profile-divider"></div>

              {/* Logout */}
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}