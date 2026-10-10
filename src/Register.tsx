
import { useState } from "react";
import type { FormEvent } from "react";
import "./Register.css";

interface RegisterProps {
  onBackToLogin: () => void;
}

function Register({ onBackToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role: "USER",
        }),
      });

      if (!response.ok) {
        let message = "Unable to create account.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Use the default error message.
        }

        setError(message);
        return;
      }

      setSuccess("Account created successfully! You can now login.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      window.setTimeout(() => {
        onBackToLogin();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* LEFT SIDE */}
      <div className="register-info">
        <div className="register-info-overlay">
          <button
            type="button"
            className="register-home-button"
            onClick={onBackToLogin}
          >
            ← Back to Login
          </button>

          <div className="register-brand">
            <span className="register-brand-icon">🏨</span>
            <span>Hotel HMS</span>
          </div>

          <div className="register-info-content">
            <p className="register-eyebrow">
              HOTEL MANAGEMENT SYSTEM
            </p>

            <h1>
              Manage your hotel
              <br />
              with confidence.
            </h1>

            <p className="register-description">
              Create your account and experience a simple, secure and
              organized hotel management system.
            </p>

            <div className="register-benefits">
              <div className="register-benefit">
                <span>✓</span>
                <div>
                  <strong>Easy to Use</strong>
                  <p>Simple hotel management experience</p>
                </div>
              </div>

              <div className="register-benefit">
                <span>✓</span>
                <div>
                  <strong>Secure Access</strong>
                  <p>Protected user authentication</p>
                </div>
              </div>

              <div className="register-benefit">
                <span>✓</span>
                <div>
                  <strong>Manage Bookings</strong>
                  <p>Organize hotel reservations easily</p>
                </div>
              </div>
            </div>
          </div>

          <div className="register-info-footer">
            🏨 Hotel Management System
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-card-top">
            <div className="register-card-logo">🏨</div>

            <button
              type="button"
              className="register-top-login"
              onClick={onBackToLogin}
            >
              Login
            </button>
          </div>

          <div className="register-heading">
            <span className="register-small-label">
              CREATE ACCOUNT
            </span>

            <h2>Welcome to Hotel HMS</h2>
            <p>Create your account to get started.</p>
          </div>

          <form
            className="register-form"
            onSubmit={handleRegister}
          >
            {/* NAME */}
            <div className="register-input-group">
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="register-input-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="register-input-group">
              <label htmlFor="register-password">Password</label>

              <div className="register-password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <span className="register-helper">
                Use at least 6 characters.
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="register-input-group">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="register-password-wrapper">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="register-message register-error"
                role="alert"
              >
                <span>!</span>
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div
                className="register-message register-success"
                role="status"
              >
                <span>✓</span>
                {success}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="register-login-link">
            <span>Already have an account?</span>
            <button type="button" onClick={onBackToLogin}>
              Sign in
            </button>
          </div>

          <div className="register-footer">
            © 2026 Hotel HMS · Hotel Management System
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
