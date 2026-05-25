import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiLogIn,
  FiArrowLeft, FiCheckCircle, FiSend,
} from "react-icons/fi";

export default function Login() {
  const [form, setForm]             = useState({ email: "", password: "" });
  const [message, setMessage]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth }  = useAuth();
  const navigate     = useNavigate();

  // Forgot-password sub-flow
  const [view, setView]           = useState("login"); // "login" | "forgot" | "sent"
  const [fpEmail, setFpEmail]     = useState("");
  const [fpMsg, setFpMsg]         = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      setAuth(data);
      navigate("/");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpMsg("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setView("sent");
    } catch (err) {
      setFpMsg(err.message);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-root {
          min-height: calc(100vh - 64px);
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 15% 15%, rgba(90,78,246,0.14) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 85%, rgba(109,86,255,0.1) 0%, transparent 45%),
            linear-gradient(160deg, #f0f2ff 0%, #eef2ff 100%);
        }
        .login-card {
          width: min(100%, 420px);
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 64px rgba(90,78,246,0.13), 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(148,163,184,0.14);
          overflow: hidden;
        }
        .login-top {
          padding: 2.5rem 2.5rem 2rem;
          text-align: center;
        }
        .login-badge {
          width: 62px; height: 62px;
          border-radius: 18px;
          background: linear-gradient(135deg, #5a4ef6, #7c5fff);
          display: inline-grid; place-items: center;
          font-size: 1.55rem; color: #fff;
          box-shadow: 0 12px 30px rgba(90,78,246,0.35);
          margin-bottom: 1.25rem;
        }
        .login-title {
          font-size: 1.8rem; font-weight: 900;
          letter-spacing: -0.04em; color: #0d1730;
          margin: 0 0 0.35rem;
        }
        .login-sub {
          font-size: 0.88rem; color: #5e6b86;
          margin: 0; line-height: 1.55;
        }
        .login-body {
          padding: 0 2.5rem 2.5rem;
          display: grid; gap: 1rem;
        }
        .login-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .login-lbl {
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: #5e6b86;
        }
        .login-input-row { position: relative; display: flex; align-items: center; }
        .login-icon {
          position: absolute; left: 1rem;
          color: #94a3b8; font-size: 1rem;
          pointer-events: none; display: flex;
        }
        .login-input {
          width: 100%;
          padding: 0.88rem 1rem 0.88rem 2.75rem;
          border: 1.5px solid rgba(148,163,184,0.28);
          border-radius: 14px; background: #f8f9fe;
          font-size: 0.94rem; color: #0d1730;
          font-family: inherit; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .login-input:focus {
          border-color: #5a4ef6; background: #fff;
          box-shadow: 0 0 0 4px rgba(90,78,246,0.1);
        }
        .login-input::placeholder { color: #b0bec5; }
        .eye-toggle {
          position: absolute; right: 0.85rem;
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 1rem;
          display: grid; place-items: center;
          padding: 0.2rem; transition: color 0.2s ease;
        }
        .eye-toggle:hover { color: #5a4ef6; }
        .forgot-link {
          display: block; text-align: right;
          font-size: 0.8rem; font-weight: 600;
          color: #5a4ef6; background: none; border: none;
          cursor: pointer; padding: 0; margin-top: -0.25rem;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 0.75; }
        .login-error {
          padding: 0.82rem 1rem;
          background: #fff5f5; border: 1px solid #fecaca;
          border-radius: 12px; color: #dc2626;
          font-size: 0.87rem; font-weight: 500;
        }
        .login-submit {
          width: 100%; padding: 0.95rem; border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #5a4ef6, #7c5fff);
          color: #fff; font-size: 1rem; font-weight: 800;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 0.55rem;
          box-shadow: 0 10px 28px rgba(90,78,246,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          margin-top: 0.25rem; font-family: inherit;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(90,78,246,0.38);
        }
        .login-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .login-foot {
          text-align: center; font-size: 0.87rem; color: #5e6b86;
          padding: 1.25rem 2.5rem;
          border-top: 1px solid rgba(148,163,184,0.14);
          background: #fafbff;
        }
        .login-foot a { color: #5a4ef6; font-weight: 700; }
        .login-foot a:hover { text-decoration: underline; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.82rem; font-weight: 700; color: #5a4ef6;
          background: none; border: none; cursor: pointer;
          padding: 0; margin-bottom: 0.25rem; transition: opacity 0.2s;
        }
        .back-btn:hover { opacity: 0.75; }
        .fp-info {
          padding: 0.9rem 1rem;
          background: #f0f2ff; border: 1px solid #c7d2fe;
          border-radius: 12px; color: #4338ca;
          font-size: 0.87rem; line-height: 1.6;
        }
        .sent-icon {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5a4ef6, #7c5fff);
          display: inline-grid; place-items: center;
          font-size: 2rem; color: #fff;
          box-shadow: 0 12px 30px rgba(90,78,246,0.35);
          margin-bottom: 1.25rem;
        }
        @media (max-width: 480px) {
          .login-top  { padding: 2rem 1.5rem 1.5rem; }
          .login-body { padding: 0 1.5rem 2rem; }
          .login-foot { padding: 1rem 1.5rem; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* ── Login view ── */}
          {view === "login" && (
            <>
              <div className="login-top">
                <div className="login-badge"><FiLogIn /></div>
                <h1 className="login-title">Welcome back</h1>
                <p className="login-sub">Sign in to your Monone Matlab account</p>
              </div>

              <form className="login-body" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label className="login-lbl" htmlFor="l-email">Email Address</label>
                  <div className="login-input-row">
                    <FiMail className="login-icon" />
                    <input
                      id="l-email"
                      className="login-input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-lbl" htmlFor="l-password">Password</label>
                  <div className="login-input-row">
                    <FiLock className="login-icon" />
                    <input
                      id="l-password"
                      className="login-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => { setView("forgot"); setFpEmail(form.email); setFpMsg(""); }}
                  >
                    Forgot password?
                  </button>
                </div>

                {message && <div className="login-error">{message}</div>}

                <button type="submit" className="login-submit" disabled={loading}>
                  <FiLogIn />
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <div className="login-foot">
                Don't have an account?{" "}
                <Link to="/register">Create one</Link>
              </div>
            </>
          )}

          {/* ── Forgot-password view ── */}
          {view === "forgot" && (
            <>
              <div className="login-top">
                <div className="login-badge"><FiMail /></div>
                <h1 className="login-title">Reset Password</h1>
                <p className="login-sub">We'll send a reset link to your email</p>
              </div>

              <form className="login-body" onSubmit={handleForgot}>
                <button type="button" className="back-btn" onClick={() => setView("login")}>
                  <FiArrowLeft /> Back to Sign In
                </button>

                <div className="fp-info">
                  Enter the email address linked to your account and we'll email you a link to reset your password.
                </div>

                <div className="login-field">
                  <label className="login-lbl" htmlFor="fp-email">Email Address</label>
                  <div className="login-input-row">
                    <FiMail className="login-icon" />
                    <input
                      id="fp-email"
                      className="login-input"
                      type="email"
                      placeholder="you@example.com"
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {fpMsg && <div className="login-error">{fpMsg}</div>}

                <button type="submit" className="login-submit" disabled={fpLoading}>
                  <FiSend />
                  {fpLoading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="login-foot">
                Remembered it?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  style={{ background: "none", border: "none", color: "#5a4ef6", fontWeight: 700, cursor: "pointer", fontSize: "inherit" }}
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* ── Email sent confirmation ── */}
          {view === "sent" && (
            <>
              <div className="login-top">
                <div className="sent-icon"><FiCheckCircle /></div>
                <h1 className="login-title">Check your email</h1>
                <p className="login-sub">
                  A reset link has been sent to <strong>{fpEmail}</strong>.
                  Click the link in the email to choose a new password.
                  The link expires in 1 hour.
                </p>
              </div>

              <div className="login-body" style={{ paddingTop: 0 }}>
                <button
                  type="button"
                  className="login-submit"
                  onClick={() => { setView("forgot"); setFpMsg(""); }}
                >
                  <FiMail /> Resend Email
                </button>
              </div>

              <div className="login-foot">
                <Link to="/login" onClick={() => setView("login")}>Back to Sign In</Link>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
