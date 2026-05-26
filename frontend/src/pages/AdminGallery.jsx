import React, { useState, useEffect, useRef } from "react";
import { Check, Edit2, Image, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminGallery() {
  const { auth } = useAuth();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [title, setTitle]         = useState("");
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [editId, setEditId]       = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const fileRef = useRef();

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/gallery`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch gallery");
      setItems(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function openModal() {
    setTitle(""); setFile(null); setPreview(null);
    setShowModal(true);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleCreate() {
    if (!title.trim() || !file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("image", file);
      const res = await fetch(`${apiBase}/api/admin/gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchItems();
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) { setError(err.message); }
  }

  async function handleRename(id) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (!res.ok) throw new Error("Update failed");
      setItems(prev => prev.map(i => i._id === id ? { ...i, title: editTitle.trim() } : i));
      setEditId(null);
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 24,
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ag-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
        .gallery-card { background:#fff; border-radius:16px; overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,.07); transition:transform .2s,box-shadow .2s; }
        .gallery-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(0,0,0,.13); }
        .gallery-img { width:100%; height:160px; object-fit:cover; display:block; }
        .overlay-modal { position:fixed; inset:0; background:rgba(0,0,0,.5);
          display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }
        .modal-box { background:#fff; border-radius:20px; width:100%; max-width:460px;
          box-shadow:0 24px 64px rgba(0,0,0,.22); overflow:hidden; }
        .drop-zone { border:2px dashed #c7d2fe; border-radius:12px; padding:32px 20px;
          text-align:center; cursor:pointer; transition:border-color .2s,background .2s; }
        .drop-zone:hover { border-color:#3b4fd8; background:#f5f7ff; }
        @media(max-width:480px){ .gallery-grid{grid-template-columns:1fr 1fr;} }
      `}</style>

      <div className="ag-root" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#1a1f6e,#3b4fd8)", borderRadius: 16,
          padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600, letterSpacing: ".08em",
              textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <Image style={{ fontSize: 14 }} /> Gallery
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Photo Gallery</h1>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, margin: 0 }}>
              Upload and manage community photos.
            </p>
          </div>
          <button onClick={openModal} style={{ display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#1a1f6e", border: "none", borderRadius: 12,
            padding: "11px 22px", fontSize: 13, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,.15)" }}>
            <Plus style={{ fontSize: 15 }} /> Upload Photo
          </button>
        </div>

        {/* Stats */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)", display: "inline-flex", alignItems: "center", gap: 8,
          width: "fit-content" }}>
          <Image style={{ color: "#3b4fd8" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{items.length}</span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>photo{items.length !== 1 ? "s" : ""}</span>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "10px 16px", color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none",
              border: "none", color: "#dc2626", cursor: "pointer" }}><X /></button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: 48 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 64, color: "#94a3b8" }}>
            <Image style={{ fontSize: 40, marginBottom: 12, opacity: .4 }} />
            <p style={{ fontWeight: 600, color: "#475569" }}>No photos yet</p>
            <p style={{ fontSize: 13 }}>Click "Upload Photo" to add the first one.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map(item => (
              <div className="gallery-card" key={item._id}>
                <img src={item.imageUrl} alt={item.title} className="gallery-img" />
                <div style={{ padding: "10px 12px 12px" }}>
                  {editId === item._id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #c7d2fe",
                          fontSize: 13, outline: "none" }}
                        onKeyDown={e => e.key === "Enter" && handleRename(item._id)} autoFocus />
                      <button onClick={() => handleRename(item._id)}
                        style={{ background: "#eef2ff", border: "none", borderRadius: 8,
                          color: "#3b4fd8", padding: "6px 8px", cursor: "pointer" }}>
                        <Check />
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8,
                          color: "#64748b", padding: "6px 8px", cursor: "pointer" }}>
                        <X />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {item.title}
                      </p>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { setEditId(item._id); setEditTitle(item.title); }}
                          style={{ background: "#eef2ff", border: "none", borderRadius: 7,
                            color: "#3b4fd8", padding: "5px 7px", cursor: "pointer", fontSize: 13 }}>
                          <Edit2 />
                        </button>
                        <button onClick={() => handleDelete(item._id)}
                          style={{ background: "#fef2f2", border: "none", borderRadius: 7,
                            color: "#ef4444", padding: "5px 7px", cursor: "pointer", fontSize: 13 }}>
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="overlay-modal" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#1a1f6e,#3b4fd8)", padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: 0,
                display: "flex", alignItems: "center", gap: 8 }}>
                <UploadCloud /> Upload Photo
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff",
                  borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
                <X />
              </button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                  textTransform: "uppercase", color: "#94a3b8", marginBottom: 7 }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Enter photo title…"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10,
                    border: "1.5px solid #e8e5f7", background: "#f8f7ff", fontSize: 14,
                    color: "#1a1235", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                  textTransform: "uppercase", color: "#94a3b8", marginBottom: 7 }}>
                  Photo <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleFile} style={{ display: "none" }} />
                {preview ? (
                  <div style={{ position: "relative" }}>
                    <img src={preview} alt="preview"
                      style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10 }} />
                    <button onClick={() => { setFile(null); setPreview(null); fileRef.current.value = ""; }}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.55)",
                        border: "none", color: "#fff", borderRadius: 8, width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X />
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone" onClick={() => fileRef.current.click()}>
                    <UploadCloud style={{ fontSize: 28, color: "#3b4fd8", marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#3b4fd8" }}>
                      Click to choose a photo
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
                      JPG, PNG, WEBP · max 10 MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                  background: "transparent", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving || !title.trim() || !file}
                style={{ padding: "9px 22px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#1a1f6e,#3b4fd8)", color: "#fff",
                  fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: (!title.trim() || !file) ? .5 : 1 }}>
                {saving ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
