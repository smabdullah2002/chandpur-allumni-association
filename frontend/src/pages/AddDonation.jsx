import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Hash,
  MessageSquare,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FALLBACK_CATEGORIES = [
  { name: "General Donation",  amount: 0 },
  { name: "Education Fund",    amount: 0 },
  { name: "Health Support",    amount: 0 },
  { name: "Emergency Relief",  amount: 0 },
  { name: "Community Event",   amount: 0 },
  { name: "Infrastructure",    amount: 0 },
];

const AddDonation = () => {
  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    txn: "",
    message: "",
  });
  const [receipt, setReceipt] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const fileRef = useRef();
  const { auth } = useAuth();

  useEffect(() => {
    fetch(`${apiBase}/api/donations/categories`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(r => r.json())
      .then(data => {
        setCategories(Array.isArray(data) && data.length > 0 ? data : FALLBACK_CATEGORIES);
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setCategoriesLoading(false));
  }, [auth.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > 1000) return;
    if (name === "category") {
      const cat = categories.find(c => c.name === value);
      setForm((p) => ({
        ...p,
        category: value,
        amount: cat?.amount ? String(cat.amount) : p.amount,
      }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    const valid = ["image/jpeg", "image/png", "application/pdf"];
    if (!valid.includes(file.type))
      return alert("Only JPEG, PNG, or PDF allowed.");
    if (file.size > 5 * 1024 * 1024) return alert("File must be under 5MB.");
    setReceipt(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date || !receipt) return;
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("category", form.category);
      payload.append("amount", form.amount);
      payload.append("date", form.date);
      payload.append("txn", form.txn);
      payload.append("message", form.message);
      payload.append("receipt", receipt);

      const response = await fetch(`${apiBase}/api/donations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit donation");
      }

      setSubmitted(true);
      setForm({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        txn: "",
        message: "",
      });
      setReceipt(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)",
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .add-root * { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; box-sizing: border-box; }

        .add-hero {
          background: linear-gradient(135deg, #1a1f6e 0%, #2d3282 40%, #3b4fd8 100%);
          border-radius: 24px;
          padding: 36px 44px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(45,50,130,0.35);
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .add-hero::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px;
          background: rgba(255,255,255,0.06); border-radius: 50%;
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          padding: 10px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s; white-space: nowrap;
          z-index: 1; position: relative;
        }
        .back-btn:hover { background: rgba(255,255,255,0.25); }

        /* info panel */
        .info-panel {
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #e8e5f7;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .info-header {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          padding: 18px 28px;
          border-bottom: 1px solid #e8e5f7;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #5b21b6;
          display: flex; align-items: center; gap: 8px;
        }
        .info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
        }
        .info-block {
          padding: 24px 28px;
        }
        .info-block + .info-block {
          border-left: 1px solid #f1f5f9;
        }
        .info-block-title {
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #3b4fd8; margin: 0 0 14px;
        }
        .info-row {
          display: flex; gap: 6px; font-size: 13px;
          color: #475569; margin-bottom: 8px; line-height: 1.5;
        }
        .info-key { font-weight: 700; color: #1e293b; white-space: nowrap; }

        /* form card */
        .form-card {
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #e8e5f7;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          padding: 36px 40px;
        }

        .field-label {
          display: block;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
        }
        .req { color: #ef4444; margin-left: 2px; }
        .opt { color: #94a3b8; font-weight: 500; font-size: 10px; margin-left: 4px; letter-spacing: 0; text-transform: none; }

        .field-input {
          width: 100%; padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid #e8e5f7;
          background: #f8f7ff;
          font-size: 14px; color: #1a1235;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: #3b4fd8;
          box-shadow: 0 0 0 3px rgba(59,79,216,0.10);
          background: #fff;
        }
        .field-input::placeholder { color: #b0aac8; }

        .amount-wrap { position: relative; }
        .amount-prefix {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 16px; font-weight: 700; color: #3b4fd8;
          pointer-events: none;
        }
        .amount-wrap .field-input { padding-left: 32px; font-size: 18px; font-weight: 700; }

        .hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }

        /* drop zone */
        .drop-zone {
          border: 2px dashed #c7d2fe;
          border-radius: 14px;
          background: #f5f7ff;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .drop-zone:hover, .drop-zone.drag { border-color: #3b4fd8; background: #eef1ff; }
        .drop-icon { font-size: 32px; color: #3b4fd8; margin-bottom: 10px; }
        .drop-label { font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
        .drop-sub { font-size: 12px; color: #94a3b8; }

        .receipt-preview {
          display: flex; align-items: center; gap: 12px;
          background: #f0fdf4; border: 1.5px solid #bbf7d0;
          border-radius: 12px; padding: 14px 16px;
        }
        .receipt-icon { font-size: 22px; color: #10b981; }
        .receipt-name { font-size: 13px; font-weight: 600; color: #065f46; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .receipt-remove { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; padding: 4px; }
        .receipt-remove:hover { color: #ef4444; }

        textarea.field-input { resize: vertical; min-height: 110px; }
        .char-count { font-size: 12px; color: #94a3b8; text-align: right; margin-top: 4px; }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .submit-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #1a1f6e 0%, #3b4fd8 100%);
          color: #fff; border: none; border-radius: 14px;
          font-size: 14px; font-weight: 800; letter-spacing: 0.06em;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(45,50,130,0.35);
          transition: all 0.22s; margin-top: 8px;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(45,50,130,0.45); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .success-wrap {
          text-align: center; padding: 64px 24px;
        }
        .success-circle {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #1a1f6e, #3b4fd8);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 34px; color: #fff;
          margin: 0 auto 20px;
          box-shadow: 0 8px 28px rgba(45,50,130,0.35);
        }

        @media (max-width: 768px) {
          .add-hero { flex-direction: column; align-items: flex-start; padding: 28px 20px; }
          .form-card { padding: 24px 20px; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .info-grid { grid-template-columns: 1fr; }
          .info-block + .info-block { border-left: none; border-top: 1px solid #f1f5f9; }
        }
      `}</style>

      <div
        className="add-root"
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Hero */}
        <div className="add-hero">
          <div style={{ zIndex: 1, position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <CreditCard style={{ color: "#a5b4fc", fontSize: 16 }} />
              <span
                style={{
                  color: "#a5b4fc",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Donation Portal
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              Add New Donation
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                margin: "6px 0 0",
              }}
            >
              Record a new contribution to the fund.
            </p>
          </div>
          <Link to="/donations" className="back-btn">
            <ArrowLeft /> Back to List
          </Link>
        </div>

        {/* Bank Info Panel */}
        <div className="info-panel">
          <div className="info-header">
            <CreditCard /> Payment Information
          </div>
          <div className="info-grid">
            <div className="info-block">
              <p className="info-block-title">Bank Account Details</p>
              <div className="info-row">
                <span className="info-key">Account Title:</span> Md. Delwar
                Hossain, Dewan Md. Emdadul Hoque, Md. Kabir Hossain
              </div>
              <div className="info-row">
                <span className="info-key">SB A/C No:</span> 0200025481750
              </div>
              <div className="info-row">
                <span className="info-key">Bank:</span> Agrani Bank PLC.
              </div>
              <div className="info-row">
                <span className="info-key">Branch:</span> Amin Court Corporate
                Branch, Dhaka.
              </div>
            </div>
            <div className="info-block">
              <p className="info-block-title">Mobile Banking (bKash)</p>
              <div className="info-row">
                <span className="info-key">Treasurer:</span> Md. Kabir Hossain,
                Chandpur Allumni Association- Jahangirnagar University
              </div>
              <div className="info-row">
                <span className="info-key">Planning Editor:</span> Md. Billal
                Hossain, Chandpur Allumni Association- Jahangirnagar University
              </div>
              <div className="info-row">
                <span className="info-key">bKash No:</span> 01760 227766
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="form-card">
          {submitted ? (
            <div className="success-wrap">
              <div className="success-circle">
                <CheckCircle />
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 8px",
                }}
              >
                Donation Submitted!
              </h3>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                Your donation record has been submitted for review.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  background: "none",
                  border: "1.5px solid #3b4fd8",
                  color: "#3b4fd8",
                  padding: "10px 28px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Add Another
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0 0 4px",
                  }}
                >
                  Donation Details
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                  Fields marked <span style={{ color: "#ef4444" }}>*</span> are
                  required.
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="field-label">
                  <Tag style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Fee Category <span className="opt">(Optional)</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="field-input"
                  style={{ cursor: "pointer" }}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "— Select Category —"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}{c.amount ? ` — ৳${c.amount}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount + Date */}
              <div className="form-grid-2">
                <div>
                  <label className="field-label">
                    Amount <span className="req">*</span>
                  </label>
                  <div className="amount-wrap">
                    <span className="amount-prefix">৳</span>
                    <input
                      className="field-input"
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {form.category && categories.find(c => c.name === form.category)?.amount > 0 && (
                    <p className="hint">Auto-filled from selected category. You can edit if needed.</p>
                  )}
                </div>
                <div>
                  <label className="field-label">
                    <Calendar
                      style={{ marginRight: 5, verticalAlign: "middle" }}
                    />
                    Donation Date <span className="req">*</span>
                  </label>
                  <input
                    className="field-input"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {/* TXN */}
              <div>
                <label className="field-label">
                  <Hash style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Transaction Number (TXN){" "}
                  <span className="opt">(Optional)</span>
                </label>
                <input
                  className="field-input"
                  type="text"
                  name="txn"
                  value={form.txn}
                  onChange={handleChange}
                  placeholder="Enter reference number"
                />
                <p className="hint">
                  Optional reference number for the transaction.
                </p>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="field-label">
                  <UploadCloud
                    style={{ marginRight: 5, verticalAlign: "middle" }}
                  />
                  Payment Receipt <span className="req">*</span>
                </label>
                {receipt ? (
                  <div className="receipt-preview">
                    <CheckCircle className="receipt-icon" />
                    <span className="receipt-name">{receipt.name}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      {(receipt.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      className="receipt-remove"
                      onClick={() => setReceipt(null)}
                    >
                      <X />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`drop-zone${dragOver ? " drag" : ""}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="drop-icon">
                      <UploadCloud />
                    </div>
                    <p className="drop-label">Click to upload receipt</p>
                    <p className="drop-sub">or drag and drop here</p>
                    <p className="drop-sub" style={{ marginTop: 6 }}>
                      Max size: 5MB (JPEG, PNG, PDF)
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ display: "none" }}
                      onChange={(e) => handleFile(e.target.files[0])}
                    />
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="field-label">
                  <MessageSquare
                    style={{ marginRight: 5, verticalAlign: "middle" }}
                  />
                  Additional Message <span className="opt">(Optional)</span>
                </label>
                <textarea
                  className="field-input"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Any additional notes..."
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <span className="hint">Optional note for this donation.</span>
                  <span className="char-count">{form.message.length}/1000</span>
                </div>
              </div>

              {error && (
                <div
                  style={{ color: "#ef4444", fontWeight: 600, marginTop: 6 }}
                >
                  {error}
                </div>
              )}
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!form.amount || !form.date || !receipt || loading}
              >
                {loading ? "Submitting..." : "Submit Donation"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDonation;
