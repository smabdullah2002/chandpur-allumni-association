import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null); // "ok" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setStatus("ok");
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .rp-root {
          min-height: calc(100vh - 64px);
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 15% 15%, rgba(90,78,246,0.14) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 85%, rgba(109,86,255,0.10) 0%, transparent 45%),
            linear-gradient(160deg, #f0f2ff 0%, #eef2ff 100%);
        }
        .rp-card {
          width: min(100%, 420px);
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 64px rgba(90,78,246,0.13), 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(148,163,184,0.14);
          overflow: hidden;
        }
        .rp-top {
          padding: 2.5rem 2.5rem 2rem;
          text-align: center;
        }
        .rp-badge {
          width: 62px; height: 62px;
          border-radius: 18px;
          background: linear-gradient(135deg, #5a4ef6, #7c5fff);
          display: inline-grid;
          place-items: center;
          font-size: 1.55rem;
          color: #fff;
          box-shadow: 0 12px 30px rgba(90,78,246,0.35);
          margin-bottom: 1.25rem;
        }
        .rp-title {
          font-size: 1.8rem; font-weight: 900;
          letter-spacing: -0.04em; color: #0d1730;
          margin: 0 0 0.35rem;
        }
        .rp-sub {
          font-size: 0.88rem; color: #5e6b86;
          margin: 0; line-height: 1.55;
        }
        .rp-body {
          padding: 0 2.5rem 2.5rem;
          display: grid; gap: 1rem;
        }
        .rp-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .rp-lbl {
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: #5e6b86;
        }
        .rp-row { position: relative; display: flex; align-items: center; }
        .rp-icon {
          position: absolute; left: 1rem;
          color: #94a3b8; font-size: 1rem;
          pointer-events: none; display: flex;
        }
        .rp-input {
          width: 100%;
          padding: 0.88rem 2.75rem 0.88rem 2.75rem;
          border: 1.5px solid rgba(148,163,184,0.28);
          border-radius: 14px;
          background: #f8f9fe;
          font-size: 0.94rem; color: #0d1730;
          font-family: inherit; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .rp-input:focus {
          border-color: #5a4ef6; background: #fff;
          box-shadow: 0 0 0 4px rgba(90,78,246,0.1);
        }
        .rp-input::placeholder { color: #b0bec5; }
        .rp-eye {
          position: absolute; right: 0.85rem;
          background: none; border: none; cursor: pointer;
          color: #94a3b8; font-size: 1rem;
          display: grid; place-items: center;
          padding: 0.2rem; transition: color 0.2s;
        }
        .rp-eye:hover { color: #5a4ef6; }
        .rp-msg {
          padding: 0.82rem 1rem;
          border-radius: 12px;
          font-size: 0.87rem; font-weight: 500;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .rp-msg.ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .rp-msg.error { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; }
        .rp-btn {
          width: 100%; padding: 0.95rem;
          border: none; border-radius: 14px;
          background: linear-gradient(135deg, #5a4ef6, #7c5fff);
          color: #fff; font-size: 1rem; font-weight: 800;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 0.55rem;
          box-shadow: 0 10px 28px rgba(90,78,246,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          margin-top: 0.25rem; font-family: inherit;
        }
        .rp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(90,78,246,0.38);
        }
        .rp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .rp-foot {
          text-align: center; font-size: 0.87rem; color: #5e6b86;
          padding: 1.25rem 2.5rem;
          border-top: 1px solid rgba(148,163,184,0.14);
          background: #fafbff;
        }
        .rp-foot a { color: #5a4ef6; font-weight: 700; }
        .rp-foot a:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .rp-top  { padding: 2rem 1.5rem 1.5rem; }
          .rp-body { padding: 0 1.5rem 2rem; }
          .rp-foot { padding: 1rem 1.5rem; }
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-card">
          <div className="rp-top">
            <div className="rp-badge"><Lock /></div>
            <h1 className="rp-title">New Password</h1>
            <p className="rp-sub">Choose a strong password for your account</p>
          </div>

          {status === "ok" ? (
            <div className="rp-body">
              <div className="rp-msg ok">
                <CheckCircle style={{ flexShrink: 0 }} />
                {message} Redirecting to login…
              </div>
            </div>
          ) : (
            <form className="rp-body" onSubmit={handleSubmit}>
              <div className="rp-field">
                <label className="rp-lbl" htmlFor="rp-pwd">New Password</label>
                <div className="rp-row">
                  <Lock className="rp-icon" />
                  <input
                    id="rp-pwd"
                    className="rp-input"
                    type={showPwd ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={8}
                    required
                  />
                  <button type="button" className="rp-eye"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? "Hide" : "Show"}>
                    {showPwd ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="rp-field">
                <label className="rp-lbl" htmlFor="rp-confirm">Confirm Password</label>
                <div className="rp-row">
                  <Lock className="rp-icon" />
                  <input
                    id="rp-confirm"
                    className="rp-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    minLength={8}
                    required
                  />
                  <button type="button" className="rp-eye"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? "Hide" : "Show"}>
                    {showConfirm ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`rp-msg error`}>
                  <AlertCircle style={{ flexShrink: 0 }} />
                  {message}
                </div>
              )}

              <button type="submit" className="rp-btn" disabled={loading}>
                <Lock />
                {loading ? "Updating…" : "Set New Password"}
              </button>
            </form>
          )}

          <div className="rp-foot">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
