"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  function handleSettings() {
    setShowMenu(false);
    router.push("/settings");
  }

  return (
    <header className="admin-header">

      <div className="header-actions">

        {/* System Status */}
        <div className="header-status">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>


        {/* Notifications */}
        <button
          className="header-icon-button"
          aria-label="Notifications"
        >
          ♢
          <span className="notification-badge">3</span>
        </button>


        {/* Admin Profile */}
        <div className="profile-container">

          <button
            className="admin-profile"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="admin-avatar">
              A
            </div>

            <div className="admin-info">
              <span className="admin-name">
                Administrator
              </span>

              <span className="admin-role">
                System Admin
              </span>
            </div>

            <span className="profile-arrow">
              ▾
            </span>

          </button>


          {/* Dropdown Menu */}
          {showMenu && (
            <div className="profile-menu">

              <button>
                My Profile
              </button>

              <button onClick={handleSettings}>
                Settings
              </button>

              <div className="profile-divider"></div>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}