"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuLock,
  LuShieldCheck,
  LuTriangleAlert,
} from "react-icons/lu";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Successful login
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Back to Home */}
      <Link href="/" className="login-back">
        ← Back to Home
      </Link>

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">A</div>

          <span>
            Anomaly<span>X</span>
          </span>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-header">
            <div className="security-icon"><LuShieldCheck aria-hidden="true" /></div>

            <h1>Admin Login</h1>

            <p>Sign in to access the AnomalyX monitoring dashboard.</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>

              <input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <LuTriangleAlert aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Login */}
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="security-notice">
            <LuLock aria-hidden="true" />

            <div>
              <strong>Authorized Access Only</strong>

              <p>This system is restricted to authorized administrators.</p>
            </div>
          </div>
        </div>

        <p className="login-footer">AnomalyX • Admin Fraud Monitoring System</p>
      </div>
    </main>
  );
}
