import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiBell,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiPaperclip,
  FiFileText,
} from "react-icons/fi";

export default function AdminNotices() {
  const { auth } = useAuth();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    publishNow: true,
    eventDate: "",
    eventLocation: "",
  });
  const [pdfFile, setPdfFile]     = useState(null);
  const [removePdf, setRemovePdf] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/admin/notices`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notices");
      setNotices(await res.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingNotice(null);
    setFormData({ title: "", content: "", category: "general", publishNow: true, eventDate: "", eventLocation: "" });
    setPdfFile(null);
    setRemovePdf(false);
    setShowModal(true);
  }

  function openEdit(notice) {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      publishNow: notice.status === "published",
      eventDate: "",
      eventLocation: "",
    });
    setPdfFile(null);
    setRemovePdf(false);
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editingNotice
        ? `${apiBaseUrl}/api/admin/notices/${editingNotice._id}`
        : `${apiBaseUrl}/api/admin/notices`;

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("content", formData.content);
      fd.append("category", formData.category);
      fd.append("status", formData.publishNow ? "published" : "draft");
      if (formData.category === "event") {
        fd.append("eventDate", formData.eventDate);
        fd.append("eventLocation", formData.eventLocation);
      }
      if (pdfFile) fd.append("pdf", pdfFile);
      if (removePdf) fd.append("removePdf", "true");

      const res = await fetch(url, {
        method: editingNotice ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });
      if (!res.ok)
        throw new Error(editingNotice ? "Failed to update" : "Failed to create");
      await fetchNotices();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(notice) {
    try {
      const fd = new FormData();
      fd.append("title", notice.title);
      fd.append("content", notice.content);
      fd.append("category", notice.category);
      fd.append("status", "published");
      const res = await fetch(`${apiBaseUrl}/api/admin/notices/${notice._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to publish");
      await fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase()),
  );

  const categoryMeta = {
    general: {
      label: "General",
      bg: "#eef1ff",
      color: "#3b4fd8",
      border: "#c7d2fe",
    },
    donation: {
      label: "Donation",
      bg: "#edfcf3",
      color: "#10b981",
      border: "#6ee7b7",
    },
    event: {
      label: "Event",
      bg: "#fff8ec",
      color: "#f59e0b",
      border: "#fcd34d",
    },
    emergency: {
      label: "Emergency",
      bg: "#fef2f2",
      color: "#ef4444",
      border: "#fca5a5",
    },
  };

  const statusMeta = {
    draft: {
      label: "Draft",
      bg: "#f8fafc",
      color: "#64748b",
      border: "#e2e8f0",
      icon: <FiClock style={{ fontSize: 11 }} />,
    },
    published: {
      label: "Published",
      bg: "#edfcf3",
      color: "#10b981",
      border: "#6ee7b7",
      icon: <FiCheckCircle style={{ fontSize: 11 }} />,
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)",
        fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .an-root * { font-family: 'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing: border-box; }

        .an-hero {
          background: linear-gradient(135deg,#1a1f6e 0%,#2d3282 40%,#3b4fd8 100%);
          border-radius: 24px;
          padding: 36px 44px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(45,50,130,.35);
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .an-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:rgba(255,255,255,.06); border-radius:50%; }

        .create-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #2d3282;
          border: none; border-radius: 12px;
          padding: 11px 22px; font-size: 13px; font-weight: 800;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,.15);
          transition: all .2s; z-index: 1; position: relative;
        }
        .create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

        .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .stat-card {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #f1f5f9;
          padding: 20px 24px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: all .22s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.10); }
        .stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }

        .table-card {
          background: #fff; border-radius: 20px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 16px rgba(0,0,0,.05);
          overflow: hidden;
        }
        .table-header {
          padding: 22px 28px 18px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .search-wrap { position: relative; }
        .search-wrap input {
          padding: 9px 14px 9px 36px; border-radius: 10px;
          border: 1.5px solid #e8e5f7; background: #f8f7ff;
          font-size: 13px; color: #1a1235; outline: none;
          font-family: 'Plus Jakarta Sans',sans-serif;
          transition: border-color .2s; width: min(220px, 100%);
        }
        .search-wrap input:focus { border-color: #3b4fd8; }
        .search-wrap input::placeholder { color: #b0aac8; }
        .search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#b0aac8; font-size:14px; }

        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #f8fafc; }
        th {
          padding: 11px 20px; text-align: left;
          font-size: 10px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #94a3b8;
        }
        td { padding: 14px 20px; border-top: 1px solid #f8fafc; vertical-align: middle; }
        tr:hover td { background: #fafbff; }

        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          border: 1px solid;
        }
        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          border: 1px solid;
        }

        .action-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; transition: all .18s;
        }
        .btn-publish { background:#edfcf3; color:#10b981; }
        .btn-publish:hover { background:#10b981; color:#fff; }
        .btn-edit { background:#eef1ff; color:#3b4fd8; }
        .btn-edit:hover { background:#3b4fd8; color:#fff; }
        .btn-delete { background:#fef2f2; color:#ef4444; }
        .btn-delete:hover { background:#ef4444; color:#fff; }

        .empty-state { padding: 64px 20px; text-align: center; }
        .empty-icon { width:64px; height:64px; background:#eef1ff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; color:#3b4fd8; margin:0 auto 14px; }

        .error-banner {
          background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 12px;
          padding: 12px 18px; font-size: 13px; color: #dc2626;
          display: flex; align-items: center; gap: 8px;
        }

        /* Modal */
        .modal-bg {
          position: fixed; inset: 0; background: rgba(15,19,64,.45);
          display: flex; align-items: flex-start; justify-content: center;
          z-index: 100; padding: 20px;
          overflow-y: auto;
        }
        .modal-box {
          background: #fff; border-radius: 24px;
          width: 100%; max-width: 520px;
          box-shadow: 0 24px 80px rgba(15,19,64,.35);
          overflow: visible;
          animation: slideUp .22s ease;
          margin: auto;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        .modal-head {
          background: linear-gradient(135deg,#1a1f6e 0%,#3b4fd8 100%);
          padding: 24px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .modal-close {
          width:32px; height:32px; border-radius:8px;
          background:rgba(255,255,255,.15); border:none; color:#fff;
          cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px;
          transition: background .18s;
        }
        .modal-close:hover { background:rgba(255,255,255,.25); }
        .modal-body { padding: 28px; display: flex; flex-direction: column; gap: 18px; }
        .field-label { display:block; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#94a3b8; margin-bottom:7px; }
        .field-input {
          width:100%; padding:12px 14px; border-radius:11px;
          border:1.5px solid #e8e5f7; background:#f8f7ff;
          font-size:14px; color:#1a1235;
          font-family:'Plus Jakarta Sans',sans-serif; outline:none;
          transition:border-color .2s, box-shadow .2s;
        }
        .field-input:focus { border-color:#3b4fd8; box-shadow:0 0 0 3px rgba(59,79,216,.10); background:#fff; }
        .field-input::placeholder { color:#b0aac8; }
        textarea.field-input { resize:vertical; min-height:120px; }
        .modal-foot {
          padding: 18px 28px 24px;
          display: flex; gap: 10px; justify-content: flex-end;
          border-top: 1px solid #f1f5f9;
        }
        .btn-cancel {
          padding:10px 20px; border-radius:10px; border:1.5px solid #e8e5f7;
          background:#fff; font-size:13px; font-weight:700; color:#64748b; cursor:pointer;
          transition:all .18s;
        }
        .btn-cancel:hover { border-color:#3b4fd8; color:#3b4fd8; }
        .btn-save {
          padding:10px 24px; border-radius:10px; border:none;
          background:linear-gradient(135deg,#1a1f6e 0%,#3b4fd8 100%);
          font-size:13px; font-weight:800; color:#fff; cursor:pointer;
          box-shadow:0 4px 16px rgba(45,50,130,.3); transition:all .22s;
          display:flex; align-items:center; gap:7px;
        }
        .btn-save:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(45,50,130,.4); }
        .btn-save:disabled { opacity:.6; cursor:not-allowed; transform:none; }

        @media(max-width:640px){
          .an-hero{flex-direction:column;align-items:flex-start;padding:24px 20px;}
          .stats-row{grid-template-columns:1fr;}
          .table-header{flex-direction:column;align-items:flex-start;}
          .search-wrap input{width:100%;}
        }

        /* PDF viewer modal */
        .pdf-overlay {
          position:fixed; inset:0; background:rgba(10,14,40,.7);
          backdrop-filter:blur(6px); z-index:200;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:16px;
        }
        .pdf-toolbar {
          width:100%; max-width:900px; display:flex; align-items:center;
          justify-content:space-between; gap:12px; margin-bottom:10px;
        }
        .pdf-title {
          color:#fff; font-size:14px; font-weight:700;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .pdf-toolbar-actions { display:flex; gap:8px; flex-shrink:0; }
        .pdf-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:8px; border:1px solid rgba(255,255,255,.25);
          background:rgba(255,255,255,.12); color:#fff;
          font-size:12px; font-weight:700; cursor:pointer; transition:background .15s;
        }
        .pdf-btn:hover { background:rgba(255,255,255,.22); }
        .pdf-frame {
          width:100%; max-width:900px; flex:1;
          border:none; border-radius:12px;
          background:#fff; min-height:0;
          height: min(80vh, 700px);
        }
        .pdf-link-btn {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 8px; border-radius:6px; border:none;
          background:#eef2ff; color:#3b4fd8;
          font-size:11px; font-weight:600; cursor:pointer;
          margin-top:4px; transition:background .15s;
        }
        .pdf-link-btn:hover { background:#c7d2fe; }
      `}</style>

      <div
        className="an-root"
        style={{
          maxWidth: 1050,
          margin: "0 auto",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Hero */}
        <div className="an-hero">
          <div style={{ zIndex: 1, position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <FiBell style={{ color: "#a5b4fc", fontSize: 16 }} />
              <span
                style={{
                  color: "#a5b4fc",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Admin Panel
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 4px",
              }}
            >
              Notice Management
            </h1>
            <p
              style={{ color: "rgba(255,255,255,.6)", fontSize: 14, margin: 0 }}
            >
              Create, edit, and publish announcements to members.
            </p>
          </div>
          <button className="create-btn" onClick={openCreate}>
            <FiPlus style={{ fontSize: 15 }} /> Create Notice
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            {
              label: "Total Notices",
              value: notices.length,
              iconBg: "#eef1ff",
              iconColor: "#3b4fd8",
              icon: <FiBell />,
            },
            {
              label: "Published",
              value: notices.filter((n) => n.status === "published").length,
              iconBg: "#edfcf3",
              iconColor: "#10b981",
              icon: <FiCheckCircle />,
            },
            {
              label: "Drafts",
              value: notices.filter((n) => n.status === "draft").length,
              iconBg: "#fff8ec",
              iconColor: "#f59e0b",
              icon: <FiClock />,
            },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div
                className="stat-icon"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                {s.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    margin: "0 0 3px",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <FiAlertCircle style={{ fontSize: 15 }} /> {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-card">
          <div className="table-header">
            <div>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 2px",
                }}
              >
                All Notices
              </h2>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                {filtered.length} notice{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              Loading notices…
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-icon">
                            <FiBell />
                          </div>
                          <p
                            style={{
                              fontWeight: 700,
                              color: "#334155",
                              fontSize: 15,
                              margin: "0 0 5px",
                            }}
                          >
                            No notices found
                          </p>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: 13,
                              margin: 0,
                            }}
                          >
                            Click "Create Notice" to add your first
                            announcement.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((notice) => {
                      const cat =
                        categoryMeta[notice.category] || categoryMeta.general;
                      const st = statusMeta[notice.status] || statusMeta.draft;
                      return (
                        <tr key={notice._id}>
                          <td style={{ maxWidth: 260 }}>
                            <p
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                margin: "0 0 3px",
                                fontSize: 14,
                              }}
                            >
                              {notice.title}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 240,
                              }}
                            >
                              {notice.content?.substring(0, 70)}…
                            </p>
                            {notice.pdf && (
                              <button className="pdf-link-btn" onClick={() => setViewingPdf(notice.pdf)}>
                                <FiFileText style={{ fontSize: 11 }} /> View Document
                              </button>
                            )}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: cat.bg,
                                color: cat.color,
                                borderColor: cat.border,
                              }}
                            >
                              {cat.label}
                            </span>
                          </td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                background: st.bg,
                                color: st.color,
                                borderColor: st.border,
                              }}
                            >
                              {st.icon} {st.label}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: "#475569" }}>
                            {notice.createdBy?.fullName || "—"}
                          </td>
                          <td
                            style={{
                              fontSize: 13,
                              color: "#94a3b8",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(notice.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {notice.status === "draft" && (
                                <button
                                  className="action-btn btn-publish"
                                  title="Publish"
                                  onClick={() => handlePublish(notice)}
                                >
                                  <FiSend style={{ fontSize: 13 }} />
                                </button>
                              )}
                              <button
                                className="action-btn btn-edit"
                                title="Edit"
                                onClick={() => openEdit(notice)}
                              >
                                <FiEdit2 style={{ fontSize: 13 }} />
                              </button>
                              <button
                                className="action-btn btn-delete"
                                title="Delete"
                                onClick={() => handleDelete(notice._id)}
                              >
                                <FiTrash2 style={{ fontSize: 13 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      {viewingPdf && (
        <div className="pdf-overlay" onClick={() => setViewingPdf(null)}>
          <div className="pdf-toolbar" onClick={e => e.stopPropagation()}>
            <span className="pdf-title">Document Preview</span>
            <div className="pdf-toolbar-actions">
              <a
                href={viewingPdf}
                download
                className="pdf-btn"
                onClick={e => e.stopPropagation()}
              >
                Download
              </a>
              <button className="pdf-btn" onClick={() => setViewingPdf(null)}>
                <FiX /> Close
              </button>
            </div>
          </div>
          <iframe
            className="pdf-frame"
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingPdf)}&embedded=true`}
            title="PDF Preview"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 16,
                  }}
                >
                  <FiBell />
                </div>
                <div>
                  <p
                    style={{
                      color: "#a5b4fc",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Notice
                  </p>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {editingNotice ? "Edit Notice" : "Create Notice"}
                  </h2>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div>
                <label className="field-label">
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  className="field-input"
                  placeholder="Enter notice title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="field-label">Category</label>
                <select
                  className="field-input"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <option value="general">General</option>
                  <option value="donation">Donation</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="field-label">
                  Content <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  className="field-input"
                  placeholder="Write the notice content…"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>

              {/* Event-specific fields */}
              {formData.category === "event" && (
                <>
                  <div>
                    <label className="field-label">
                      Event Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="field-input"
                      value={formData.eventDate}
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label">Event Location</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Matlab Community Hall"
                      value={formData.eventLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, eventLocation: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* PDF attachment (optional) */}
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <FiPaperclip style={{ fontSize: 12 }} /> PDF Attachment
                  <span style={{ color: "#94a3b8", fontWeight: 500, textTransform: "none",
                    letterSpacing: 0, fontSize: 10 }}>(optional)</span>
                </label>
                <input ref={pdfRef} type="file" accept=".pdf" style={{ display: "none" }}
                  onChange={e => { setPdfFile(e.target.files[0] || null); setRemovePdf(false); }} />

                {/* Show existing PDF when editing */}
                {editingNotice?.pdf && !removePdf && !pdfFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                    background: "#f0fdf4", border: "1.5px solid #6ee7b7", borderRadius: 10, marginBottom: 8 }}>
                    <FiFileText style={{ color: "#10b981", flexShrink: 0 }} />
                    <button
                      onClick={() => setViewingPdf(editingNotice.pdf)}
                      style={{ flex: 1, fontSize: 13, color: "#065f46", fontWeight: 600,
                        background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: 0 }}>
                      View current PDF
                    </button>
                    <button onClick={() => { setRemovePdf(true); }}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                        fontSize: 14, display: "flex", alignItems: "center" }}>
                      <FiX />
                    </button>
                  </div>
                )}

                {pdfFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                    background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 10 }}>
                    <FiFileText style={{ color: "#3b4fd8", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: "#1e293b", fontWeight: 600,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pdfFile.name}
                    </span>
                    <button onClick={() => { setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ""; }}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                        fontSize: 14, display: "flex", alignItems: "center" }}>
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => pdfRef.current.click()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "9px 16px", borderRadius: 10, border: "1.5px dashed #c7d2fe",
                      background: "#f8f7ff", color: "#3b4fd8", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", width: "100%", justifyContent: "center" }}>
                    <FiPaperclip /> Attach PDF
                  </button>
                )}
              </div>
            </div>

            {/* Publish toggle */}
            <div style={{ padding: "0 28px 16px" }}>
              <div
                onClick={() => setFormData({ ...formData, publishNow: !formData.publishNow })}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  background: formData.publishNow ? "#edfcf3" : "#f8fafc",
                  border: `1.5px solid ${formData.publishNow ? "#6ee7b7" : "#e2e8f0"}`,
                  transition: "all .2s",
                }}
              >
                <div style={{
                  width: 40, height: 22, borderRadius: 99,
                  background: formData.publishNow ? "#10b981" : "#cbd5e1",
                  position: "relative", transition: "background .2s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 3,
                    left: formData.publishNow ? 21 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left .2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}/>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: formData.publishNow ? "#065f46" : "#475569" }}>
                    {formData.publishNow ? "Publish immediately" : "Save as draft"}
                  </div>
                  <div style={{ fontSize: 11, color: formData.publishNow ? "#10b981" : "#94a3b8", marginTop: 1 }}>
                    {formData.publishNow
                      ? "Visible to all users right away"
                      : "Hidden until you publish manually"}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.content}
              >
                {saving ? (
                  "Saving…"
                ) : editingNotice ? (
                  <>
                    <FiEdit2 style={{ fontSize: 13 }} /> Save Changes
                  </>
                ) : (
                  <>
                    <FiPlus style={{ fontSize: 13 }} /> Create Notice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}