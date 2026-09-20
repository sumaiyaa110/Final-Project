"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { getAlertSummary } from "@/services/api";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);

  const [fraudAlerts, setFraudAlerts] = useState(0);

  const [previousAlerts, setPreviousAlerts] = useState(0);

  const [hasNewAlert, setHasNewAlert] = useState(false);

  const router = useRouter();

  // =====================================================
  // LIVE NOTIFICATION COUNT
  // =====================================================

  useEffect(() => {
    async function loadNotificationCount() {
      try {
        const data = await getAlertSummary();

        const currentAlerts = Number(data.pending) || 0;

        // ==========================================
        // DETECT NEW ALERT
        // ==========================================

        if (previousAlerts !== 0 && currentAlerts > previousAlerts) {
          setHasNewAlert(true);

          setTimeout(() => {
            setHasNewAlert(false);
          }, 1000);
        }

        setFraudAlerts(currentAlerts);

        setPreviousAlerts(currentAlerts);
      } catch (error) {
        console.log("Notification API Error:", error);
      }
    }

    loadNotificationCount();

    const interval = setInterval(loadNotificationCount, 5000);

    return () => clearInterval(interval);
  }, [previousAlerts]);

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  // =====================================================
  // PROFILE
  // =====================================================

  function handleProfile() {
    setShowMenu(false);

    router.push("/profile");
  }

  // =====================================================
  // SETTINGS
  // =====================================================

  function handleSettings() {
    setShowMenu(false);

    router.push("/settings");
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  function handleNotifications() {
    router.push("/alerts");
  }

  return (
    <header className="admin-header">
      <div className="header-actions">
        {/* SYSTEM STATUS */}

        <div className="header-status">
          <span className="status-dot"></span>

          <span>System Online</span>
        </div>

        {/* NOTIFICATIONS */}

        <button
          className={`header-icon-button ${
            hasNewAlert ? "notification-new" : ""
          }`}
          onClick={handleNotifications}
          aria-label={`Pending fraud alerts: ${fraudAlerts}`}
          title="View fraud alerts"
        >
          ♢
          {fraudAlerts > 0 && (
            <span className="notification-badge">
              {fraudAlerts > 99 ? "99+" : fraudAlerts}
            </span>
          )}
        </button>

        {/* ADMIN PROFILE */}

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

          {showMenu && (
            <div className="profile-menu">
              <button onClick={handleProfile}>My Profile</button>

              <button onClick={handleSettings}>Settings</button>

              <div className="profile-divider"></div>

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