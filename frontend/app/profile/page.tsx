"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="profile-page">
        {/* ==========================================
            PAGE HEADER
        ========================================== */}
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your administrator profile and account information.</p>
          </div>

          <button
            className="profile-settings-button"
            onClick={() => router.push("/settings")}
          >
            ⚙ Settings
          </button>
        </div>

        {/* ==========================================
            PROFILE HERO
        ========================================== */}
        <div className="profile-hero">
          <div className="profile-identity">
            <div className="profile-avatar-large">A</div>

            <div className="profile-identity-info">
              <div className="profile-name-row">
                <h2>Administrator</h2>

                <span className="profile-active-badge">
                  <span className="profile-active-dot"></span>
                  Active
                </span>
              </div>

              <p className="profile-role">System Administrator</p>

              <p className="profile-email">admin@anomalyx.com</p>
            </div>
          </div>

          <div className="profile-hero-meta">
            <div className="profile-meta-item">
              <span>Department</span>
              <strong>Financial Security</strong>
            </div>

            <div className="profile-meta-item">
              <span>Last Login</span>
              <strong>Today</strong>
            </div>

            <div className="profile-meta-item">
              <span>Account Since</span>
              <strong>September 2026</strong>
            </div>
          </div>
        </div>

        {/* ==========================================
            CONTENT GRID
        ========================================== */}
        <div className="profile-content-grid">
          {/* ========================================
              PERSONAL INFORMATION
          ======================================== */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Personal Information</h2>
                <p>Your personal and contact information.</p>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Full Name</span>

                <span className="profile-value">Administrator</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Email Address</span>

                <span className="profile-value">admin@anomalyx.com</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Phone Number</span>

                <span className="profile-value">+880 1XXXXXXXXX</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Department</span>

                <span className="profile-value">Financial Security</span>
              </div>
            </div>
          </div>

          {/* ========================================
              ACCOUNT INFORMATION
          ======================================== */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Account Information</h2>
                <p>Details about your administrator account.</p>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Role</span>

                <span className="profile-value">System Administrator</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Account Status</span>

                <span className="profile-value">
                  <span className="account-status">Active</span>
                </span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Last Login</span>

                <span className="profile-value">Today</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-label">Account Created</span>

                <span className="profile-value">September 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            SECURITY
        ========================================== */}
        <div className="profile-card profile-security-card">
          <div className="profile-card-header">
            <div>
              <h2>Security</h2>
              <p>Manage your administrator account security.</p>
            </div>
          </div>

          <div className="security-item">
            <div className="security-icon">🔒</div>

            <div className="security-info">
              <h3>Password</h3>

              <p>
                Your password is used to protect access to the AnomalyX
                administrator panel.
              </p>

              <span className="security-status">● Password protected</span>
            </div>

            <button className="profile-button">Change Password</button>
          </div>
        </div>

        {/* ==========================================
            ACCESS INFORMATION
        ========================================== */}
        <div className="profile-card profile-access-card">
          <div className="profile-card-header">
            <div>
              <h2>Administrator Access</h2>
              <p>Access privileges assigned to this account.</p>
            </div>
          </div>

          <div className="access-list">
            <div className="access-item">
              <span className="access-check">✓</span>
              <span>Dashboard Monitoring</span>
            </div>

            <div className="access-item">
              <span className="access-check">✓</span>
              <span>Transaction Monitoring</span>
            </div>

            <div className="access-item">
              <span className="access-check">✓</span>
              <span>Fraud Investigation</span>
            </div>

            <div className="access-item">
              <span className="access-check">✓</span>
              <span>Network Analysis</span>
            </div>

            <div className="access-item">
              <span className="access-check">✓</span>
              <span>Reports & Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}