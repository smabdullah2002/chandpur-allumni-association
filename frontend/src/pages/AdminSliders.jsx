import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  AlignLeft,
  Edit2,
  Eye,
  EyeOff,
  Hash,
  Image,
  Plus,
  Search,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const emptyForm = { headline: "", subtext: "", ctaText: "", displayOrder: 0, status: "visible" };

export default function AdminSliders() {
  const { auth } = useAuth();
  const fileRef = useRef();
  const [sliders, setSliders]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchSliders(); }, []);

  async function fetchSliders() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/sliders`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setSliders(Array.isArray(data) ? data : data.sliders || []);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  }

  function openEdit(slider) {
    setEditing(slider);
    setForm({
      headline: slider.headline || "",
      subtext: slider.subtext || "",
      ctaText: slider.ctaText || "",
      displayOrder: slider.displayOrder ?? 0,
      status: slider.status || "visible",
    });
    setImageFile(null);
    setImagePreview(slider.imageUrl || "");
    setShowModal(true);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!imageFile && !editing?.imageUrl && !form.headline) {
      return setError("Please upload an image or provide a headline");
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("headline", form.headline);
      formData.append("subtext", form.subtext);
      formData.append("ctaText", form.ctaText);
      formData.append("displayOrder", String(form.displayOrder));
      formData.append("status", form.status);
      if (imageFile) formData.append("image", imageFile);

      const url = editing
        ? `${apiBase}/api/admin/sliders/${editing._id}`
        : `${apiBase}/api/admin/sliders`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      await fetchSliders();
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleToggleStatus(slider) {
    try {
      const res = await fetch(`${apiBase}/api/admin/sliders/${slider._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ status: slider.status === "visible" ? "hidden" : "visible" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchSliders();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this slider?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/sliders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchSliders();
    } catch (err) { setError(err.message); }
  }

  const filtered = sliders.filter(s => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    return matchFilter && (!q || s.headline?.toLowerCase().includes(q) || s.subtext?.toLowerCase().includes(q));
  });

  const totalVisible = sliders.filter(s => s.status === "visible").length;
  const totalHidden  = sliders.filter(s => s.status === "hidden").length;

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .as-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .s-tr td { transition:background .12s; }
        .s-tr:hover td { background:#f8fafc; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5);
          backdrop-filter:blur(4px); z-index:999;
          display:flex; align-items:flex-start; justify-content:center;
          padding:20px; overflow-y:auto; }
        .modal { background:#fff; border-radius:20px; width:100%; max-width:520px;
          box-shadow:0 24px 64px rgba(0,0,0,0.22); margin:auto; overflow:hidden; }
        .modal-hero { background:linear-gradient(135deg,#1a1f6e,#3b4fd8);
          padding:24px 28px; display:flex; align-items:center; justify-content:space-between; }
        .field-wrap { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .field-label { font-size:11px; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:#94a3b8; display:flex; align-items:center; gap:6px; }
        .field-input { padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
          font-size:14px; color:#1e293b; outline:none; transition:border .2s;
          font-family:'Plus Jakarta Sans',sans-serif; width:100%; background:#fafafa; }
        .field-input:focus { border-color:#3b4fd8; background:#fff; }
        .upload-zone { border:2px dashed #c7d2fe; border-radius:12px;
          padding:20px; text-align:center; cursor:pointer;
          background:#fafbff; transition:all .2s; }
        .upload-zone:hover { border-color:#3b4fd8; background:#eef2ff; }
        .upload-zone input { display:none; }
        .img-preview { width:100%; height:140px; object-fit:cover;
          border-radius:10px; border:1px solid #e2e8f0; margin-top:8px; }
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
        .icon-btn { width:34px; height:34px; border-radius:9px; display:inline-flex;
          align-items:center; justify-content:center; border:1px solid;
          cursor:pointer; transition:all .15s; background:transparent; font-size:14px; }
        .ib-edit { color:#3b4fd8; border-color:#c7d2fe; }
        .ib-edit:hover { background:#eef1ff; }
        .ib-del { color:#ef4444; border-color:#fecaca; }
        .ib-del:hover { background:#fef2f2; }
        .toggle-btn { display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:8px; border:1px solid #e2e8f0;
          background:transparent; cursor:pointer; font-size:12px;
          font-weight:600; color:#64748b; transition:all .15s; }
        .toggle-btn:hover { border-color:#3b4fd8; color:#3b4fd8; }
        .filter-btn { padding:5px 11px; border-radius:8px; border:none;
          background:transparent; cursor:pointer; font-size:12px;
          color:#64748b; font-weight:500; display:flex; align-items:center; gap:4px; }
        .filter-btn.active { background:#fff; color:#3730a3; box-shadow:0 1px 3px rgba(0,0,0,.1); }
        .fcount { font-size:11px; background:#e2e8f0; border-radius:99px; padding:1px 5px; color:#64748b; }
        .preview-img { width:90px; height:58px; object-fit:cover;
          border-radius:10px; border:1px solid #e2e8f0; display:block; }
        .preview-ph { width:90px; height:58px; border-radius:10px;
          background:#f1f5f9; border:1px dashed #cbd5e1;
          display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:20px; }
      `}</style>

      <div className="as-root">
        {/* Hero */}
        <div style={S.hero}>
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <Image style={{ color:"#a5b4fc", fontSize:16 }}/>
              <span style={{ color:"#a5b4fc", fontSize:12, fontWeight:600,
                letterSpacing:".08em", textTransform:"uppercase" }}>Admin Panel</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 4px" }}>
              Slider Management
            </h1>
            <p style={{ color:"rgba(255,255,255,.6)", fontSize:14, margin:0 }}>
              Upload images and manage homepage banner slides.
            </p>
          </div>
          <button className="add-btn" onClick={openCreate}>
            <Plus style={{ fontSize:15 }}/> Add New Slider
          </button>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {[
            { label:"TOTAL", val:sliders.length,  color:"#3730a3", bg:"#eef2ff" },
            { label:"VISIBLE", val:totalVisible,  color:"#16a34a", bg:"#f0fdf4" },
            { label:"HIDDEN",  val:totalHidden,   color:"#ca8a04", bg:"#fefce8" },
          ].map(s => (
            <div key={s.label} style={{...S.statCard, borderTop:`3px solid ${s.color}`}}>
              <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:".07em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={S.errorBanner}>
            {error}
            <button onClick={()=>setError(null)}
              style={{ marginLeft:"auto", background:"none", border:"none", color:"#dc2626", cursor:"pointer" }}>
              <X/>
            </button>
          </div>
        )}

        {/* Table */}
        <div style={S.tableSection}>
          <div style={S.tableHeader}>
            <div>
              <div style={S.tableTitle}>All Sliders</div>
              <div style={S.tableCount}>{filtered.length} slider{filtered.length!==1?"s":""}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:3, background:"#f8fafc",
                border:"1px solid #e2e8f0", borderRadius:10, padding:3 }}>
                {["all","visible","hidden"].map(f => (
                  <button key={f} className={`filter-btn${filter===f?" active":""}`}
                    onClick={()=>setFilter(f)}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                    <span className="fcount">
                      {f==="all"?sliders.length:sliders.filter(s=>s.status===f).length}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ position:"relative" }}>
                <Search style={{ position:"absolute", left:10, top:"50%",
                  transform:"translateY(-50%)", color:"#94a3b8", fontSize:13 }}/>
                <input placeholder="Search..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{ paddingLeft:30, paddingRight:12, paddingTop:7, paddingBottom:7,
                    border:"1px solid #e2e8f0", borderRadius:10, fontSize:13,
                    outline:"none", width:"min(190px, 100%)", background:"#f8fafc" }}/>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={S.empty}>Loading sliders...</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    <th style={S.th}>PREVIEW</th>
                    <th style={S.th}>HEADLINE & DETAILS</th>
                    <th style={{...S.th, textAlign:"center"}}>ORDER</th>
                    <th style={{...S.th, textAlign:"center"}}>STATUS</th>
                    <th style={{...S.th, textAlign:"right"}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(slider => (
                    <tr key={slider._id} className="s-tr">
                      <td style={S.td}>
                        {slider.imageUrl
                          ? <img src={slider.imageUrl} alt={slider.headline} className="preview-img"/>
                          : <div className="preview-ph"><Image/></div>}
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight:700, color:"#1e293b", fontSize:14, marginBottom:2 }}>
                          {slider.headline || "Untitled"}
                        </div>
                        {slider.subtext && (
                          <div style={{ fontSize:12, color:"#64748b", marginBottom:4 }}>{slider.subtext}</div>
                        )}
                        {slider.ctaText && (
                          <span style={{ fontSize:11, fontWeight:600, background:"#eef2ff",
                            color:"#3730a3", padding:"2px 8px", borderRadius:6 }}>
                            {slider.ctaText}
                          </span>
                        )}
                      </td>
                      <td style={{...S.td, textAlign:"center"}}>
                        <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700,
                          background:"#f1f5f9", color:"#475569", padding:"3px 10px", borderRadius:8 }}>
                          #{slider.displayOrder ?? 0}
                        </span>
                      </td>
                      <td style={{...S.td, textAlign:"center"}}>
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:5,
                          fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:99,
                          background: slider.status==="visible" ? "#f0fdf4" : "#f8fafc",
                          color: slider.status==="visible" ? "#166534" : "#64748b",
                        }}>
                          {slider.status==="visible"
                            ? <Eye style={{fontSize:11}}/>
                            : <EyeOff style={{fontSize:11}}/>}
                          {slider.status==="visible" ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td style={{...S.td, textAlign:"right"}}>
                        <div style={{ display:"flex", alignItems:"center",
                          justifyContent:"flex-end", gap:6 }}>
                          <button className="toggle-btn" onClick={()=>handleToggleStatus(slider)}>
                            {slider.status==="visible"
                              ? <><EyeOff style={{fontSize:12}}/> Hide</>
                              : <><Eye style={{fontSize:12}}/> Show</>}
                          </button>
                          <button className="icon-btn ib-edit" onClick={()=>openEdit(slider)}>
                            <Edit2/>
                          </button>
                          <button className="icon-btn ib-del" onClick={()=>handleDelete(slider._id)}>
                            <Trash2/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length===0 && (
                <div style={S.empty}>No sliders yet. Click "Add New Slider" to create one.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hero">
              <div>
                <div style={{ fontSize:11, color:"#a5b4fc", fontWeight:600,
                  letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>Slider</div>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:0 }}>
                  {editing ? "Edit Slider" : "Add New Slider"}
                </h2>
              </div>
              <button onClick={()=>setShowModal(false)}
                style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)",
                  color:"#fff", borderRadius:"50%", width:34, height:34,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", fontSize:15 }}>
                <X/>
              </button>
            </div>

            <div style={{ padding:"24px 28px" }}>
              {/* Image Upload */}
              <div className="field-wrap">
                <label className="field-label"><Upload style={{fontSize:12}}/> Slider Image</label>
                <div className="upload-zone" onClick={()=>fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}/>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="img-preview"/>
                  ) : (
                    <div style={{ color:"#64748b" }}>
                      <Upload style={{ fontSize:28, color:"#3b4fd8", marginBottom:8 }}/>
                      <div style={{ fontSize:13, fontWeight:600 }}>Click to upload image</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>
                        JPG, PNG, WEBP — saved to Cloudinary
                      </div>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button onClick={()=>{ setImageFile(null); setImagePreview(editing?.imageUrl||""); }}
                    style={{ fontSize:12, color:"#dc2626", background:"none",
                      border:"none", cursor:"pointer", marginTop:4, textAlign:"left" }}>
                    <X size={12} style={{ marginRight: 6 }} />
                    Remove image
                  </button>
                )}
              </div>

              {/* Headline */}
              <div className="field-wrap">
                <label className="field-label"><Type style={{fontSize:12}}/> Headline</label>
                <input className="field-input" placeholder="e.g. চাঁদপুর অ্যালামনাই অ্যাসোসিয়েশন"
                  value={form.headline} onChange={e=>setForm({...form,headline:e.target.value})}/>
              </div>

              {/* Subtext */}
              <div className="field-wrap">
                <label className="field-label"><AlignLeft style={{fontSize:12}}/> Subtext</label>
                <input className="field-input" placeholder="Short description"
                  value={form.subtext} onChange={e=>setForm({...form,subtext:e.target.value})}/>
              </div>

              {/* CTA */}
              <div className="field-wrap">
                <label className="field-label">CTA / Tag Text</label>
                <input className="field-input" placeholder="e.g. Community First"
                  value={form.ctaText} onChange={e=>setForm({...form,ctaText:e.target.value})}/>
              </div>

              {/* Order + Status */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="field-wrap" style={{ marginBottom:0 }}>
                  <label className="field-label"><Hash style={{fontSize:12}}/> Display Order</label>
                  <input type="number" min="0" className="field-input"
                    value={form.displayOrder}
                    onChange={e=>setForm({...form,displayOrder:e.target.value})}/>
                </div>
                <div className="field-wrap" style={{ marginBottom:0 }}>
                  <label className="field-label">Status</label>
                  <select className="field-input" value={form.status}
                    onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding:"0 28px 24px", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="cancel-btn" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Uploading..." : editing ? "Save Changes" : "Add Slider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { minHeight:"100vh", background:"var(--bg)", padding:"24px",
    fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" },
  hero: { background:"var(--primary)",
    borderRadius:20, padding:"36px 40px", color:"#fff",
    boxShadow:"0 20px 60px rgba(15,23,42,.25)",
    display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 },
  statCard: { background:"#fff", borderRadius:12, padding:"18px 20px",
    boxShadow:"0 1px 3px rgba(0,0,0,.06)" },
  errorBanner: { padding:"10px 16px", background:"#fef2f2",
    border:"1px solid #fecaca", borderRadius:8, color:"#dc2626",
    fontSize:13, display:"flex", alignItems:"center", gap:8 },
  tableSection: { background:"#fff", borderRadius:14,
    boxShadow:"0 1px 3px rgba(0,0,0,.06)", overflow:"hidden" },
  tableHeader: { padding:"20px 24px", borderBottom:"1px solid var(--border)",
    display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
  tableTitle: { fontSize:16, fontWeight:700, color:"#1e293b" },
  tableCount: { fontSize:13, color:"#94a3b8", marginTop:2 },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700,
    color:"#94a3b8", letterSpacing:".07em", borderBottom:"1px solid var(--border)" },
  td: { padding:"14px 16px", fontSize:14, color:"#334155",
    verticalAlign:"middle", borderBottom:"1px solid var(--surface-soft)" },
  empty: { padding:48, textAlign:"center", color:"#94a3b8", fontSize:14 },
};
