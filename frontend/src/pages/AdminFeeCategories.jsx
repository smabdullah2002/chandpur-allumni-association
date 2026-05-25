import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiTag, FiPlus, FiTrash2, FiEdit2, FiSave,
  FiX, FiDollarSign, FiAlignLeft,
} from "react-icons/fi";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const emptyForm = { name: "", description: "", amount: "" };

export default function AdminFeeCategories() {
  const { auth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(emptyForm);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/fee-categories`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setCategories(data);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", amount: cat.amount });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || form.amount === "") return setError("Name and amount are required");
    setSaving(true);
    try {
      const url = editing
        ? `${apiBase}/api/admin/fee-categories/${editing._id}`
        : `${apiBase}/api/admin/fee-categories`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      await fetchCategories();
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/fee-categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCategories();
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .afc * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .afc { display:flex; flex-direction:column; gap:20px; }
        .afc-hero { background:linear-gradient(135deg,#3730a3 0%,#4f46e5 50%,#6366f1 100%);
          border-radius:16px; padding:clamp(20px,4vw,36px) clamp(18px,4vw,40px);
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .afc-stat { background:#fff; border-radius:12px; padding:clamp(14px,2vw,20px) clamp(18px,3vw,28px);
          box-shadow:0 1px 3px rgba(0,0,0,.06); border-top:3px solid #3730a3;
          display:flex; align-items:center; gap:16px; }
        @media(max-width:480px){
          .afc-hero { flex-direction:column; align-items:flex-start; }
        }
        .cat-card { background:#fff; border-radius:16px; border:1.5px solid #f1f5f9;
          box-shadow:0 2px 12px rgba(0,0,0,.05); padding:24px;
          display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
          transition:all .2s; }
        .cat-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,.1); border-color:#c7d2fe; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,.45);
          backdrop-filter:blur(4px); z-index:999;
          display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal { background:#fff; border-radius:20px; width:100%; max-width:460px;
          box-shadow:0 24px 64px rgba(0,0,0,.22); overflow:hidden; }
        .modal-hero { background:linear-gradient(135deg,#1a1f6e,#3b4fd8);
          padding:24px 28px; display:flex; align-items:center; justify-content:space-between; }
        .field-wrap { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .field-label { font-size:11px; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:#94a3b8; display:flex; align-items:center; gap:6px; }
        .field-input { padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
          font-size:14px; color:#1e293b; outline:none; transition:border .2s;
          font-family:'Plus Jakarta Sans',sans-serif; width:100%; background:#fafafa; }
        .field-input:focus { border-color:#3b4fd8; background:#fff; }
        textarea.field-input { resize:vertical; min-height:80px; }
        .save-btn { padding:11px 24px; border-radius:10px; border:none;
          background:linear-gradient(135deg,#1a1f6e,#3b4fd8); color:#fff;
          font-size:13px; font-weight:800; cursor:pointer; transition:all .2s; }
        .save-btn:hover { transform:translateY(-1px); }
        .save-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .cancel-btn { padding:11px 20px; border-radius:10px; border:1.5px solid #e2e8f0;
          background:transparent; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; }
        .cancel-btn:hover { border-color:#3b4fd8; color:#3b4fd8; }
        .add-btn { display:inline-flex; align-items:center; gap:8px;
          background:#fff; color:#1a1f6e; border:none; border-radius:10px;
          padding:10px 20px; font-size:13px; font-weight:800; cursor:pointer;
          box-shadow:0 4px 16px rgba(0,0,0,.15); transition:all .2s; }
        .add-btn:hover { transform:translateY(-2px); }
        .del-btn { padding:6px 10px; border-radius:8px; border:1.5px solid #fca5a5;
          color:#dc2626; background:transparent; font-size:12px;
          font-weight:700; cursor:pointer; transition:all .15s; }
        .del-btn:hover { background:#dc2626; color:#fff; }
        .edit-btn { padding:6px 10px; border-radius:8px; border:1.5px solid #c7d2fe;
          color:#3730a3; background:transparent; font-size:12px;
          font-weight:700; cursor:pointer; transition:all .15s; }
        .edit-btn:hover { background:#3730a3; color:#fff; }
      `}</style>

      <div className="afc">
        {/* Hero */}
        <div className="afc-hero">
          <div style={{ zIndex:1, position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <FiTag style={{ color:"#a5b4fc", fontSize:16 }}/>
              <span style={{ color:"#a5b4fc", fontSize:12, fontWeight:600,
                letterSpacing:".08em", textTransform:"uppercase" }}>Admin Panel</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 4px" }}>
              Fee Categories
            </h1>
            <p style={{ color:"rgba(255,255,255,.6)", fontSize:14, margin:0 }}>
              Define membership fee categories and amounts.
            </p>
          </div>
          <button className="add-btn" onClick={openCreate}>
            <FiPlus style={{ fontSize:15 }}/> Add Category
          </button>
        </div>

        {/* Stat */}
        <div className="afc-stat">
          <div style={{ fontSize:32, fontWeight:800, color:"#3730a3" }}>{categories.length}</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8",
            letterSpacing:".07em", textTransform:"uppercase" }}>Total Categories</div>
        </div>

        {error && (
          <div style={S.errorBanner}>
            {error}
            <button onClick={()=>setError(null)}
              style={{ marginLeft:"auto", background:"none", border:"none",
                color:"#dc2626", cursor:"pointer" }}><FiX/></button>
          </div>
        )}

        {/* Categories grid */}
        {loading ? (
          <div style={S.empty}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={S.empty}>
            No categories yet. Click "Add Category" to create one.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {categories.map((cat, i) => (
              <div key={cat._id} className="cat-card">
                <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                  {/* Number badge */}
                  <div style={{ width:40, height:40, borderRadius:12,
                    background:"#eef2ff", color:"#3730a3",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontWeight:800, fontSize:16, flexShrink:0 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:4 }}>
                      {cat.name}
                    </div>
                    {cat.description && (
                      <div style={{ fontSize:13, color:"#64748b", marginBottom:8, lineHeight:1.5 }}>
                        {cat.description}
                      </div>
                    )}
                    <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                      background:"#f0fdf4", color:"#16a34a", borderRadius:99,
                      padding:"4px 12px", fontSize:13, fontWeight:700 }}>
                      ৳{Number(cat.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button className="edit-btn" onClick={()=>openEdit(cat)}>
                    <FiEdit2 style={{ fontSize:12 }}/> Edit
                  </button>
                  <button className="del-btn" onClick={()=>handleDelete(cat._id)}>
                    <FiTrash2 style={{ fontSize:12 }}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hero">
              <div>
                <div style={{ fontSize:11, color:"#a5b4fc", fontWeight:600,
                  letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>
                  Fee Category
                </div>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:0 }}>
                  {editing ? "Edit Category" : "Add Category"}
                </h2>
              </div>
              <button onClick={()=>setShowModal(false)}
                style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)",
                  color:"#fff", borderRadius:"50%", width:34, height:34,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", fontSize:15 }}>
                <FiX/>
              </button>
            </div>

            <div style={{ padding:"24px 28px" }}>
              <div className="field-wrap">
                <label className="field-label"><FiTag style={{fontSize:11}}/> Category Name *</label>
                <input className="field-input" placeholder="e.g. Annual Membership"
                  value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div className="field-wrap">
                <label className="field-label"><FiDollarSign style={{fontSize:11}}/> Amount (৳) *</label>
                <input type="number" min="0" className="field-input" placeholder="e.g. 500"
                  value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
              </div>
              <div className="field-wrap" style={{ marginBottom:0 }}>
                <label className="field-label"><FiAlignLeft style={{fontSize:11}}/> Description</label>
                <textarea className="field-input" placeholder="Optional description"
                  value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
            </div>

            <div style={{ padding:"0 28px 24px", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="cancel-btn" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { minHeight:"100vh", background:"#f0f2f8",
    padding:"clamp(14px,3vw,24px)",
    fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" },
  errorBanner: { padding:"10px 16px", background:"#fef2f2",
    border:"1px solid #fecaca", borderRadius:8, color:"#dc2626",
    fontSize:13, display:"flex", alignItems:"center", gap:8 },
  empty: { padding:48, textAlign:"center", color:"#94a3b8",
    fontSize:14, background:"#fff", borderRadius:14 },
};