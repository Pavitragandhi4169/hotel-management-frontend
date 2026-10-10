
import { useState } from "react";
import type { FormEvent } from "react";

import "./App.css";

import Dashboard from "./Dashboard";
import Register from "./Register";
import LandingPage from "./LandingPage";

function App() {
  // Application state
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showLanding, setShowLanding] = useState(
    !localStorage.getItem("token")
  );

  const [showRegister, setShowRegister] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Login
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        setMessage("Invalid email or password");
        return;
      }

      const token = await response.text();

      localStorage.setItem("token", token);

      setLoggedIn(true);
      setShowLanding(false);
      setShowRegister(false);
      setMessage("");
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Open login page
  const openLogin = () => {
    setShowLanding(false);
    setShowRegister(false);
    setMessage("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  // Open signup page
  const openRegister = () => {
    setShowLanding(false);
    setShowRegister(true);
    setMessage("");
  };

  // Return to homepage
  const goToLanding = () => {
    setShowLanding(true);
    setShowRegister(false);
    setMessage("");
  };

  // Dashboard
  if (loggedIn) {
    return <Dashboard />;
  }

  // Signup page
  if (showRegister) {
    return (
      <Register
        onBackToLogin={() => {
          setShowRegister(false);
          setShowLanding(false);
          setMessage("");
        }}
      />
    );
  }

  // New homepage
  if (showLanding) {
    return (
      <LandingPage
        onLogin={openLogin}
        onRegister={openRegister}
      />
    );
  }

  // Login page
  return (
    <div className="login-page">
      <div className="login-info">
        <button
          type="button"
          className="login-home-button"
          onClick={goToLanding}
        >
          ← Home
        </button>

        <div className="login-info-content">
          <div className="login-brand">🏨 Hotel HMS</div>

          <h1>
            Manage your hotel
            <br />
            with confidence.
          </h1>

          <p>
            Hotel HMS gives you everything you need
            to manage rooms, customers, bookings and
            staff from one place.
          </p>

          <div className="login-feature-list">
            <div>
              <span>✦</span>
              Room Management
            </div>

            <div>
              <span>✦</span>
              Customer Management
            </div>

            <div>
              <span>✦</span>
              Booking Management
            </div>

            <div>
              <span>✦</span>
              Secure Hotel Dashboard
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-area">
        <div className="login-card">
          <div className="login-card-top">
            <div className="login-card-logo">🏨 Hotel HMS</div>

            <button type="button" onClick={goToLanding}>
              Home
            </button>
          </div>

          <h2>Sign in with your email</h2>

          <p className="login-card-subtitle">
            Welcome back! Please enter your details to continue.
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-email">Email Address</label>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>

              <div
                className="password-wrapper"
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    display: "block",
                    boxSizing: "border-box",
                    width: "100%",
                    paddingRight: "48px",
                  }}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    minWidth: "32px",
                    height: "32px",
                    padding: 0,
                    margin: 0,
                    background: "transparent",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: "18px",
                    lineHeight: 1,
                    boxShadow: "none",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {message && (
              <p className="error-message" role="alert">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account?{" "}
            <button type="button" onClick={openRegister}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
