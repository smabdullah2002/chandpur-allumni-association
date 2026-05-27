import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminEvents() {
  const { auth } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/events`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(Array.isArray(data?.events) ? data.events : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormData({ title: "", date: "", location: "", description: "" });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : null;
        throw new Error(data?.error || "Failed to create event");
      }
      await fetchEvents();
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId) {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      await fetchEvents();
    } catch (err) {
      setError(err.message || "Failed to delete event");
    }
  }

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ae-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .ae-hero {
          background: linear-gradient(135deg,#0f1340 0%,#2d3282 40%,#3b4fd8 100%);
          border-radius: 22px; padding: 34px 38px; color:#fff;
          box-shadow:0 20px 60px rgba(15,19,64,.35); position:relative; overflow:hidden;
          display:flex; align-items:center; justify-content:space-between; gap:16px;
        }
        .ae-hero::after { content:''; position:absolute; top:-60px; right:-60px;
          width:200px; height:200px; background:rgba(255,255,255,.08); border-radius:50%; }
        .create-btn {
          display:inline-flex; align-items:center; gap:6px;
          background:#fff; color:#2d3282; border:none; border-radius:12px;
          padding:10px 20px; font-weight:800; font-size:13px; cursor:pointer;
          box-shadow:0 6px 18px rgba(0,0,0,.2);
        }
        .ae-card { background:#fff; border-radius:18px; border:1.5px solid #f1f5f9;
          box-shadow:0 2px 16px rgba(0,0,0,.05); overflow:hidden; }
        table { width:100%; border-collapse:collapse; }
        th { text-align:left; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:#94a3b8; padding:12px 18px; background:#f8fafc; }
        td { padding:14px 18px; border-top:1px solid #f8fafc; }
        .pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:99px;
          font-size:11px; font-weight:700; background:#eef2ff; color:#3b4fd8; }
        .delete-btn { width:32px; height:32px; border-radius:8px; border:none; cursor:pointer;
          background:#fef2f2; color:#ef4444; display:inline-flex; align-items:center; justify-content:center; }
        .delete-btn:hover { background:#ef4444; color:#fff; }
        .error { background:#fef2f2; border:1.5px solid #fca5a5; color:#dc2626;
          border-radius:12px; padding:12px 16px; margin:16px 0; font-size:13px; }
        .modal-bg { position:fixed; inset:0; background:rgba(15,19,64,.45);
          display:flex; align-items:center; justify-content:center; padding:20px; z-index:100; }
        .modal { background:#fff; border-radius:18px; width:100%; max-width:520px;
          box-shadow:0 24px 64px rgba(0,0,0,.22); overflow:hidden; }
        .modal-head { background:linear-gradient(135deg,#1a1f6e 0%,#3b4fd8 100%);
          padding:20px 24px; color:#fff; font-weight:800; }
        .modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:14px; }
        .field-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#94a3b8; }
        .field-input { width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid #e2e8f0;
          font-size:14px; }
        textarea.field-input { min-height:110px; resize:vertical; }
        .modal-foot { padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; }
        .btn-cancel { padding:9px 16px; border-radius:10px; border:1.5px solid #e2e8f0;
          background:#fff; color:#64748b; font-weight:700; cursor:pointer; }
        .btn-save { padding:9px 18px; border-radius:10px; border:none;
          background:linear-gradient(135deg,#1a1f6e,#3b4fd8); color:#fff; font-weight:800; cursor:pointer; }
        .btn-save:disabled { opacity:.6; cursor:not-allowed; }
      `}</style>

      <div className="ae-root" style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 20px" }}>
        <div className="ae-hero">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Calendar style={{ fontSize: 16, color: "#a5b4fc" }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#a5b4fc" }}>
                Admin Panel
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Event Management</h1>
            <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.65)", fontSize: 13 }}>
              Publish events that appear in the notice board.
            </p>
          </div>
          <button className="create-btn" onClick={openCreate}>
            <Plus style={{ fontSize: 15 }} /> New Event
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="ae-card" style={{ marginTop: 20 }}>
          {loading ? (
            <div style={{ padding: 22, color: "#94a3b8" }}>Loading events...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{event.title}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{event.description || "—"}</div>
                      </td>
                      <td>{fmtDate(event.date)}</td>
                      <td>
                        {event.location ? (
                          <span className="pill">
                            <MapPin style={{ fontSize: 11 }} />
                            {event.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{event.status || "upcoming"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="delete-btn" onClick={() => handleDelete(event._id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 22, color: "#94a3b8" }}>
                        No events yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">Create Event</div>
            <div className="modal-body">
              <div>
                <div className="field-label">Title</div>
                <input
                  className="field-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              <div>
                <div className="field-label">Date</div>
                <input
                  type="date"
                  className="field-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <div className="field-label">Location</div>
                <input
                  className="field-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location"
                />
              </div>
              <div>
                <div className="field-label">Description</div>
                <textarea
                  className="field-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
