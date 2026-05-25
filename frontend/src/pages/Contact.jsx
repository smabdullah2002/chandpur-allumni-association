import React, { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiCheck, FiSend, FiFacebook, FiInstagram, FiLinkedin } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Contact = () => {
  const { auth } = useAuth();
  const user = auth?.user;

  const [form, setForm] = useState({
    name: user?.fullName || user?.email || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://formspree.io/f/xjglwrdz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.message || "Submission failed");
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .contact-root * { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; box-sizing: border-box; }

        /* ── Hero ── */
        .contact-hero {
          background: linear-gradient(160deg, #5b2edc 0%, #7c3aed 45%, #9d5cf6 100%);
          padding: 72px 24px 120px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .contact-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 110%, rgba(255,255,255,0.08) 0%, transparent 70%);
        }
        .breadcrumb {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85);
          margin-bottom: 28px;
          position: relative; z-index: 1;
        }
        .breadcrumb span { color: rgba(255,255,255,0.5); }
        .hero-title {
          font-size: clamp(36px, 6vw, 58px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 20px;
          position: relative; z-index: 1;
        }
        .hero-sub {
          font-size: 16px; color: rgba(255,255,255,0.72);
          max-width: 480px; margin: 0 auto;
          line-height: 1.7; position: relative; z-index: 1;
        }

        /* ── Contact cards ── */
        .cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: -72px auto 0;
          padding: 0 24px;
          position: relative; z-index: 2;
        }
        .contact-card {
          background: #fff;
          border-radius: 20px;
          padding: 36px 24px 28px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(91,46,220,0.10);
          border: 1px solid #ede9ff;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(91,46,220,0.18);
        }
        .card-icon-circle {
          width: 68px; height: 68px;
          background: linear-gradient(135deg, #6d35e8 0%, #9d5cf6 100%);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          font-size: 26px;
          color: #fff;
          box-shadow: 0 8px 24px rgba(109,53,232,0.35);
        }
        .card-title {
          font-size: 17px; font-weight: 800; color: #1a1235; margin: 0 0 8px;
        }
        .card-detail {
          font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;
        }

        /* ── Body ── */
        .body-wrap {
          max-width: 1100px;
          margin: 48px auto 60px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }

        /* ── Form card ── */
        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 40px 40px 36px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
          border: 1px solid #f1f0ff;
        }
        .form-title {
          font-size: 28px; font-weight: 800; color: #1a1235; margin: 0 0 6px;
        }
        .form-sub { font-size: 14px; color: #64748b; margin: 0 0 32px; }
        .field-label {
          display: block;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #94a3b8;
          margin-bottom: 8px;
        }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .field-single { margin-bottom: 20px; }
        .contact-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid #e8e5f7;
          background: #f8f7ff;
          font-size: 14px; color: #1a1235;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .contact-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
          background: #fff;
        }
        .contact-input::placeholder { color: #b0aac8; }
        textarea.contact-input { resize: vertical; min-height: 130px; }

        .send-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6d35e8 0%, #9d5cf6 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 13px; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 8px;
          box-shadow: 0 8px 24px rgba(109,53,232,0.35);
          transition: all 0.22s ease;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(109,53,232,0.45); }
        .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .success-box {
          text-align: center; padding: 48px 24px;
        }
        .success-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #6d35e8, #9d5cf6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; color: #fff;
          margin: 0 auto 20px;
          box-shadow: 0 8px 28px rgba(109,53,232,0.35);
        }

        /* ── Sidebar ── */
        .sidebar { display: flex; flex-direction: column; gap: 20px; }
        .sidebar-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          border: 1px solid #f1f0ff;
        }
        .hq-icon {
          font-size: 36px;
          display: block;
          margin-bottom: 14px;
        }
        .hq-title { font-size: 17px; font-weight: 800; color: #1a1235; margin: 0 0 6px; }
        .hq-addr { font-size: 13px; color: #64748b; margin: 0 0 18px; line-height: 1.6; }
        .directions-btn {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1.5px solid #7c3aed;
          color: #7c3aed;
          background: none;
          padding: 9px 20px;
          border-radius: 20px;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .directions-btn:hover { background: #f3eeff; }

        .sidebar-divider { height: 1px; background: #f1f5f9; margin: 14px 0; }

        .hours-title { font-size: 15px; font-weight: 800; color: #1a1235; margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .hours-row { font-size: 13px; color: #64748b; margin: 0 0 4px; }

        .social-title { font-size: 15px; font-weight: 800; color: #1a1235; margin: 14px 0 12px; }
        .social-row { display: flex; gap: 12px; }
        .social-btn {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .social-btn:hover { transform: translateY(-2px); }
        .s-fb { background: #e8f0ff; color: #1877f2; }
        .s-ig { background: #ffeef5; color: #e1306c; }
        .s-li { background: #e8f4ff; color: #0077b5; }

        @media (max-width: 768px) {
          .cards-row { grid-template-columns: 1fr; }
          .body-wrap { grid-template-columns: 1fr; }
          .field-row { grid-template-columns: 1fr; }
          .form-card { padding: 28px 20px; }
        }
      `}</style>

      <div className="contact-root">
        {/* ── Hero ── */}
        <div className="contact-hero">
          <div className="breadcrumb">
            <span>Home</span> / Contact Us
          </div>
          <h1 className="hero-title">
            Let's Create Impact
            <br />
            Together
          </h1>
          <p className="hero-sub">
            Whether you're a donor, a volunteer, or someone in need, we are here
            to listen and support.
          </p>
        </div>

        {/* ── Contact Cards ── */}
        <div className="cards-row">
          <div className="contact-card">
            <div className="card-icon-circle">
              <FiMapPin size={26} />
            </div>
            <h3 className="card-title">Visit Our Office</h3>
            <p className="card-detail">
              123 Charity Street, City Center
              <br />
              Dhaka, Bangladesh
            </p>
          </div>
          <div className="contact-card">
            <div className="card-icon-circle">
              <FiPhone size={26} />
            </div>
            <h3 className="card-title">Call Support</h3>
            <p className="card-detail">
              +880 1234–567890
              <br />
              Available during office hours
            </p>
          </div>
          <div className="contact-card">
            <div className="card-icon-circle">
              <FiMail size={26} />
            </div>
            <h3 className="card-title">Email Outreach</h3>
            <p className="card-detail">
              info@donationcollection.com
              <br />
              We reply within 24 hours
            </p>
          </div>
        </div>

        {/* ── Body: Form + Sidebar ── */}
        <div className="body-wrap">
          {/* Form */}
          <div className="form-card">
            {sent ? (
              <div className="success-box">
                <div className="success-icon">
                  <FiCheck size={30} />
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1a1235",
                    margin: "0 0 8px",
                  }}
                >
                  Message Sent!
                </h3>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  style={{
                    marginTop: 20,
                    background: "none",
                    border: "1.5px solid #7c3aed",
                    color: "#7c3aed",
                    padding: "9px 24px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="form-title">Message Direct</h2>
                <p className="form-sub">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <div className="field-row">
                  <div>
                    <label className="field-label">Full Name</label>
                    <input
                      className="contact-input"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="field-label">Email Address</label>
                    <input
                      className="contact-input"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="field-single">
                  <label className="field-label">How Can We Help?</label>
                  <input
                    className="contact-input"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject of message"
                  />
                </div>

                <div className="field-single">
                  <label className="field-label">Your Detailed Message</label>
                  <textarea
                    className="contact-input"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                {error && (
                  <div style={{ padding:"10px 14px", background:"#fef2f2",
                    border:"1px solid #fecaca", borderRadius:10,
                    color:"#dc2626", fontSize:13, fontWeight:600 }}>
                    {error}
                  </div>
                )}
                <button className="send-btn" onClick={handleSubmit} disabled={sending}>
                  <FiSend size={16} /> {sending ? "Sending…" : "Send Secure Message"}
                </button>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <span className="hq-icon">🗺️</span>
              <h3 className="hq-title">Monone Matlab Headquarters</h3>
              <p className="hq-addr">
                123 Charity Street, City Center, Dhaka, Bangladesh
              </p>
              <button className="directions-btn">Get Directions →</button>
            </div>

            <div className="sidebar-card">
              <div className="hours-title">
                <span style={{ color: "#7c3aed" }}>🕐</span> Operating Hours
              </div>
              <p className="hours-row">Monday – Friday: 9:00 AM – 5:00 PM</p>
              <p className="hours-row">Saturday: 10:00 AM – 2:00 PM</p>
              <p
                className="hours-row"
                style={{ color: "#f59e0b", fontWeight: 600 }}
              >
                Sunday: Closed
              </p>

              <div className="sidebar-divider" />

              <div className="social-title">Follow Our Journey</div>
              <div className="social-row">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn s-fb" aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn s-ig" aria-label="Instagram">
                  <FiInstagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn s-li" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
