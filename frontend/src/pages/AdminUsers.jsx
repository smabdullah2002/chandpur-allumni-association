import React, { useState, useEffect } from "react";
import {
  Book,
  Calendar,
  Check,
  CheckCircle,
  Edit2,
  Eye,
  FileText,
  Image,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Tag,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminUsers() {
  const { auth } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("all");
  const [viewUser, setViewUser]     = useState(null);  // detail modal
  const [editingUser, setEditingUser] = useState(null); // edit modal
  const [formData, setFormData]     = useState({
    fullName: "", mobileNumber: "", lastEducation: "", upazila: "", villageName: "",
  });
  const [badgeUser, setBadgeUser]   = useState(null);   // badge modal
  const [badgeForm, setBadgeForm]   = useState({ name: "", color: "#6366f1" });

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleStatusUpdate(userId, status) {
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchUsers();
      // update open modal
      if (viewUser?._id === userId) setViewUser(v => ({ ...v, status }));
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      if (viewUser?._id === userId) setViewUser(null);
    } catch (err) { setError(err.message); }
  }

  async function handleSaveEdit() {
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update user");
      await fetchUsers();
      setEditingUser(null);
    } catch (err) { setError(err.message); }
  }

  async function handleSaveBadge() {
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${badgeUser._id}/badge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(badgeForm),
      });
      if (!res.ok) throw new Error("Failed to update badge");
      await fetchUsers();
      setBadgeUser(null);
    } catch (err) { setError(err.message); }
  }

  function openBadge(user) {
    setBadgeUser(user);
    setBadgeForm({
      name: user.badge?.name || "",
      color: user.badge?.color || "#6366f1",
    });
  }

  function openEdit(user) {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || "",
      mobileNumber: user.mobileNumber || "",
      lastEducation: user.lastEducation || "",
      upazila: user.upazila || "",
      villageName: user.villageName || "",
    });
  }

  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

  const statusStyle = s =>
    s === "approved" ? { bg: "#f0fdf4", color: "#166534", dot: "#16a34a" } :
    s === "rejected" ? { bg: "#fef2f2", color: "#991b1b", dot: "#dc2626" } :
                       { bg: "#fefce8", color: "#854d0e", dot: "#ca8a04" };

  const filtered = users.filter(u => {
    const matchStatus = filterStatus === "all" || (u.status || "pending") === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.mobileNumber?.includes(q) ||
      u.upazila?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: users.length,
    pending:  users.filter(u => (u.status||"pending") === "pending").length,
    approved: users.filter(u => u.status === "approved").length,
    rejected: users.filter(u => u.status === "rejected").length,
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .au-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .u-tr:hover { background:#f8fafc; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45);
          backdrop-filter:blur(4px); z-index:999;
          display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal { background:#fff; border-radius:20px; width:100%; max-width:680px;
          max-height:92vh; overflow-y:auto;
          box-shadow:0 24px 64px rgba(0,0,0,0.22); }
        .modal-hero { background:var(--primary);
          padding:28px 32px; border-radius:20px 20px 0 0; }
        .sec-head { font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#94a3b8; padding:14px 0 6px; }
        .detail-row { display:flex; align-items:flex-start; gap:10px;
          padding:11px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
        .detail-row:last-child { border-bottom:none; }
        .d-icon { color:var(--primary); font-size:15px; margin-top:2px; flex-shrink:0; }
        .d-key { font-weight:700; color:#1e293b; min-width:130px; flex-shrink:0; }
        .d-val { color:#475569; word-break:break-all; }
        .doc-link { display:inline-flex; align-items:center; gap:6px;
          color:var(--primary); font-weight:700; text-decoration:none; font-size:13px; }
        .doc-link:hover { text-decoration:underline; }
        .act-btn { padding:6px 14px; border-radius:8px; border:1.5px solid;
          cursor:pointer; font-size:12px; font-weight:700;
          background:transparent; transition:all .15s; }
        .approve { color:#16a34a; border-color:#86efac; }
        .approve:hover { background:#16a34a; color:#fff; border-color:#16a34a; }
        .reject  { color:#dc2626; border-color:#fca5a5; }
        .reject:hover  { background:#dc2626; color:#fff; border-color:#dc2626; }
        .view-btn { display:inline-flex; align-items:center; gap:5px;
          padding:5px 10px; border-radius:8px; border:1.5px solid var(--border);
          color:var(--primary); background:transparent; font-size:12px;
          font-weight:700; cursor:pointer; transition:all .15s; }
        .view-btn:hover { background:var(--surface-soft); }
        .edit-modal { background:#fff; border-radius:20px; width:100%;
          max-width:480px; box-shadow:0 24px 64px rgba(0,0,0,0.22); }
        .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .form-group label { font-size:12px; font-weight:700; color:#64748b;
          text-transform:uppercase; letter-spacing:.06em; }
        .form-group input, .form-group select {
          padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
          font-size:14px; color:#1e293b; outline:none; transition:border .2s; }
        .form-group input:focus, .form-group select:focus { border-color:#3b4fd8; }
        @media(max-width:640px){
          .au-stats { grid-template-columns:1fr 1fr!important; }
          .modal { max-height:100vh; border-radius:0; }
        }
      `}</style>

      <div className="au-root">

        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroBadge}><Users style={{fontSize:12}}/> ADMIN PANEL</div>
          <h1 style={S.heroTitle}>User Management</h1>
          <p style={S.heroSub}>Review registrations, verify documents, and manage member access.</p>
        </div>

        {/* Stats */}
        <div className="au-stats" style={S.statsRow}>
          {[
            { label:"TOTAL USERS",    val:counts.all,      color:"#3730a3", bg:"#eef2ff" },
            { label:"PENDING",        val:counts.pending,  color:"#ca8a04", bg:"#fefce8" },
            { label:"APPROVED",       val:counts.approved, color:"#16a34a", bg:"#f0fdf4" },
            { label:"REJECTED",       val:counts.rejected, color:"#dc2626", bg:"#fef2f2" },
          ].map(s => (
            <div key={s.label} style={{...S.statCard, borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:".07em"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table section */}
        <div style={S.tableSection}>
          {/* Header */}
          <div style={S.tableHeader}>
            <div>
              <div style={S.tableTitle}>All Members</div>
              <div style={S.tableCount}>{filtered.length} user{filtered.length!==1?"s":""}</div>
            </div>
            <div style={S.controls}>
              {/* Filter tabs */}
              <div style={S.filterRow}>
                {["all","pending","approved","rejected"].map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{...S.filterBtn,...(filterStatus===f?S.filterActive:{})}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                    <span style={S.filterCount}>{counts[f]}</span>
                  </button>
                ))}
              </div>
              {/* Search */}
              <div style={S.searchWrap}>
                <Search style={S.searchIcon}/>
                <input placeholder="Search users..." value={search}
                  onChange={e=>setSearch(e.target.value)} style={S.searchInput}/>
              </div>
            </div>
          </div>

          {error && <div style={S.errorBanner}>{error}</div>}

          {loading ? (
            <div style={S.empty}>Loading users...</div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    <th style={S.th}>MEMBER</th>
                    <th style={S.th}>MOBILE</th>
                    <th style={S.th}>UPAZILA</th>
                    <th style={S.th}>EDUCATION</th>
                    <th style={S.th}>JOINED</th>
                    <th style={S.th}>STATUS</th>
                    <th style={{...S.th,textAlign:"right"}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const sc = statusStyle(u.status||"pending");
                    return (
                      <tr key={u._id} className="u-tr" style={S.tr}>
                        <td style={S.td}>
                          <div style={S.uName}>{u.fullName}</div>
                          <div style={S.uEmail}>{u.email}</div>
                        </td>
                        <td style={S.td}><span style={S.mono}>{u.mobileNumber||"—"}</span></td>
                        <td style={S.td}>{u.upazila||"—"}</td>
                        <td style={S.td}>{u.lastEducation||"—"}</td>
                        <td style={S.td}><span style={S.dateText}>{fmtDate(u.createdAt)}</span></td>
                        <td style={S.td}>
                          <span style={{...S.badge, background:sc.bg, color:sc.color}}>
                            <span style={{...S.dot, background:sc.dot}}/>
                            {u.status||"pending"}
                          </span>
                        </td>
                        <td style={{...S.td,textAlign:"right"}}>
                          <div style={{display:"flex",justifyContent:"flex-end",gap:5,flexWrap:"wrap"}}>
                            <button className="view-btn" onClick={()=>setViewUser(u)}>
                              <Eye style={{fontSize:12}}/> View
                            </button>
                            {u.role!=="super-admin" && u.status!=="approved" && (
                              <button className="act-btn approve"
                                onClick={()=>handleStatusUpdate(u._id,"approved")}>
                                <Check size={12} />
                              </button>
                            )}
                            {u.role!=="super-admin" && u.status!=="rejected" && (
                              <button className="act-btn reject"
                                onClick={()=>handleStatusUpdate(u._id,"rejected")}>
                                <X size={12} />
                              </button>
                            )}
                            <button className="act-btn" style={{color:"#3b4fd8",borderColor:"#c7d2fe"}}
                              onClick={()=>openEdit(u)}>
                              <Edit2 style={{fontSize:12}}/>
                            </button>
                            {u.role!=="super-admin" && (
                              <button className="act-btn" title="Manage Badge"
                                style={{color:"#7c3aed",borderColor:"#ddd6fe"}}
                                onClick={()=>openBadge(u)}>
                                <Tag style={{fontSize:12}}/>
                              </button>
                            )}
                            {u.role!=="super-admin" && (
                              <button className="act-btn reject"
                                onClick={()=>handleDelete(u._id)}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length===0 && <div style={S.empty}>No users found</div>}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail / View Modal ── */}
      {viewUser && (
        <div className="overlay" onClick={()=>setViewUser(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            {/* Modal hero */}
            <div className="modal-hero">
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  {/* Avatar */}
                  <div style={{width:52,height:52,borderRadius:"50%",
                    background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:22,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {viewUser.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:0}}>
                      {viewUser.fullName}
                    </h2>
                    <div style={{color:"rgba(255,255,255,.65)",fontSize:13,marginTop:3}}>
                      {viewUser.email}
                    </div>
                  </div>
                </div>
                <button onClick={()=>setViewUser(null)}
                  style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
                    color:"#fff",borderRadius:"50%",width:34,height:34,display:"flex",
                    alignItems:"center",justifyContent:"center",cursor:"pointer",
                    fontSize:15,flexShrink:0}}>
                   <X/>
                </button>
              </div>

              {/* Status + actions */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:18,flexWrap:"wrap"}}>
                {(() => { const sc=statusStyle(viewUser.status||"pending"); return (
                  <span style={{...S.badge,background:"rgba(255,255,255,.15)",
                    color:"#fff",border:"1px solid rgba(255,255,255,.25)"}}>
                    <span style={{...S.dot,background:sc.dot}}/>
                    {viewUser.status||"pending"}
                  </span>
                );})()}
                {viewUser.role!=="super-admin" && viewUser.status!=="approved" && (
                  <button className="act-btn approve"
                    style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}}
                    onClick={()=>handleStatusUpdate(viewUser._id,"approved")}>
                    <Check size={12} style={{ marginRight: 6 }} />
                    Approve
                  </button>
                )}
                {viewUser.role!=="super-admin" && viewUser.status!=="rejected" && (
                  <button className="act-btn reject"
                    style={{color:"#fca5a5",borderColor:"rgba(252,165,165,.5)"}}
                    onClick={()=>handleStatusUpdate(viewUser._id,"rejected")}>
                    <X size={12} style={{ marginRight: 6 }} />
                    Reject
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{padding:"20px 32px 28px"}}>

              {/* Personal Info */}
              <div className="sec-head">Personal Information</div>
              <DR icon={<User/>}     label="Full Name"     val={viewUser.fullName||"—"}/>
              <DR icon={<Mail/>}     label="Email"         val={viewUser.email||"—"}/>
              <DR icon={<Phone/>}    label="Mobile"        val={viewUser.mobileNumber||"—"}/>
              <DR icon={<Calendar/>} label="Date of Birth" val={viewUser.dateOfBirth||"—"}/>
              <DR icon={<Book/>}     label="Education"     val={viewUser.lastEducation||"—"}/>
              <DR icon={<Shield/>}   label="Political Aff."val={viewUser.politicalAffiliation||"—"}/>

              {/* Location */}
              <div className="sec-head" style={{marginTop:4}}>Location</div>
              <DR icon={<MapPin/>}   label="Division"      val={viewUser.division||"—"}/>
              <DR icon={<MapPin/>}   label="District"      val={viewUser.district||"Chandpur"}/>
              <DR icon={<MapPin/>}   label="Upazila"       val={viewUser.upazila||"—"}/>
              <DR icon={<MapPin/>}   label="Village"       val={viewUser.villageName||"—"}/>
              <DR icon={<MapPin/>}   label="Police Station"val={viewUser.policeStation||"—"}/>
              <DR icon={<MapPin/>}   label="Present Address"
                val={viewUser.presentAddress||"—"}/>
              <DR icon={<MapPin/>}   label="Permanent Address"
                val={viewUser.permanentAddress||"—"}/>

              {/* Documents */}
              <div className="sec-head" style={{marginTop:4}}>Submitted Documents</div>
              <DR icon={<FileText/>} label="Certificate"
                val={viewUser.certificateDocument
                  ? <a href={viewUser.certificateDocument.startsWith("http") ? viewUser.certificateDocument : `${apiBase}/uploads/${viewUser.certificateDocument}`}
                      target="_blank" rel="noopener noreferrer" className="doc-link">
                      <Eye style={{fontSize:13}}/> View Certificate
                    </a>
                  : "Not submitted"}/>
              <DR icon={<FileText/>} label="NID Document"
                val={viewUser.nidDocument
                  ? <a href={viewUser.nidDocument.startsWith("http") ? viewUser.nidDocument : `${apiBase}/uploads/${viewUser.nidDocument}`}
                      target="_blank" rel="noopener noreferrer" className="doc-link">
                      <Eye style={{fontSize:13}}/> View NID
                    </a>
                  : "Not submitted"}/>
              <DR icon={<Image/>}    label="Profile Image"
                val={viewUser.profileImage
                  ? <a href={viewUser.profileImage.startsWith("http") ? viewUser.profileImage : `${apiBase}/uploads/${viewUser.profileImage}`}
                      target="_blank" rel="noopener noreferrer" className="doc-link">
                      <Eye style={{fontSize:13}}/> View Photo
                    </a>
                  : "Not uploaded"}/>

              {/* Account */}
              <div className="sec-head" style={{marginTop:4}}>Account</div>
              <DR icon={<Shield/>}   label="Role"          val={viewUser.role||"user"}/>
              <DR icon={<Calendar/>} label="Registered"    val={fmtDate(viewUser.createdAt)}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingUser && (
        <div className="overlay" onClick={()=>setEditingUser(null)}>
          <div className="edit-modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"24px 28px",borderBottom:"1px solid #f1f5f9",
              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>
                Edit — {editingUser.fullName}
              </h2>
              <button onClick={()=>setEditingUser(null)}
                style={{background:"none",border:"none",cursor:"pointer",
                  fontSize:18,color:"#94a3b8"}}>
                <X/>
              </button>
            </div>
            <div style={{padding:"24px 28px"}}>
              {[
                {label:"Full Name",   key:"fullName",      type:"text"},
                {label:"Mobile",      key:"mobileNumber",  type:"text"},
                {label:"Education",   key:"lastEducation", type:"text"},
                {label:"Village",     key:"villageName",   type:"text"},
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} value={formData[f.key]}
                    onChange={e=>setFormData({...formData,[f.key]:e.target.value})}/>
                </div>
              ))}
              <div className="form-group">
                <label>Upazila</label>
                <select value={formData.upazila}
                  onChange={e=>setFormData({...formData,upazila:e.target.value})}>
                  <option value="">Select Upazila</option>
                  <option value="Matlab North">Matlab North</option>
                  <option value="Matlab South">Matlab South</option>
                </select>
              </div>
            </div>
            <div style={{padding:"0 28px 24px",display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setEditingUser(null)}
                style={{padding:"9px 20px",borderRadius:10,border:"1.5px solid #e2e8f0",
                  background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#64748b"}}>
                Cancel
              </button>
              <button onClick={handleSaveEdit}
                style={{padding:"9px 20px",borderRadius:10,border:"none",
                  background:"linear-gradient(135deg,#1a1f6e,#3b4fd8)",
                  color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Badge Modal ── */}
      {badgeUser && (
        <div className="overlay" onClick={()=>setBadgeUser(null)}>
          <div className="edit-modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"24px 28px",borderBottom:"1px solid #f1f5f9",
              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0,display:"flex",alignItems:"center",gap:8}}>
                <Tag style={{color:"#7c3aed"}}/> Badge — {badgeUser.fullName}
              </h2>
              <button onClick={()=>setBadgeUser(null)}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#94a3b8"}}>
                <X/>
              </button>
            </div>
            <div style={{padding:"24px 28px"}}>
              {/* Preview */}
              {badgeForm.name && (
                <div style={{marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Preview:</span>
                  <span style={{
                    display:"inline-flex",alignItems:"center",gap:4,
                    padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700,
                    background:badgeForm.color+"22",color:badgeForm.color,
                    border:`1.5px solid ${badgeForm.color}55`,
                  }}>{badgeForm.name}</span>
                </div>
              )}
              <div className="form-group">
                <label>Badge Name</label>
                <input type="text" placeholder="e.g. সভাপতি, উপদেষ্টা…"
                  value={badgeForm.name}
                  onChange={e=>setBadgeForm({...badgeForm,name:e.target.value})}/>
              </div>
              <div className="form-group">
                <label>Badge Color</label>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input type="color" value={badgeForm.color}
                    onChange={e=>setBadgeForm({...badgeForm,color:e.target.value})}
                    style={{width:44,height:36,border:"1.5px solid #e2e8f0",borderRadius:8,
                      cursor:"pointer",padding:2,background:"#fff"}}/>
                  <input type="text" value={badgeForm.color}
                    onChange={e=>setBadgeForm({...badgeForm,color:e.target.value})}
                    style={{flex:1,padding:"10px 14px",border:"1.5px solid #e2e8f0",
                      borderRadius:10,fontSize:13,color:"#1e293b",outline:"none",fontFamily:"monospace"}}/>
                </div>
                <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                  {["#6366f1","#059669","#dc2626","#d97706","#0891b2","#7c3aed","#db2777","#1e293b"].map(c=>(
                    <button key={c} onClick={()=>setBadgeForm({...badgeForm,color:c})}
                      style={{width:22,height:22,borderRadius:"50%",background:c,border:
                        badgeForm.color===c?"3px solid #1e293b":"2px solid transparent",cursor:"pointer"}}>
                    </button>
                  ))}
                </div>
              </div>
              {badgeUser.badge?.name && (
                <button onClick={()=>setBadgeForm({name:"",color:"#6366f1"})}
                  style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid #fecaca",
                    color:"#dc2626",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:600,marginBottom:4}}>
                  Remove Badge
                </button>
              )}
            </div>
            <div style={{padding:"0 28px 24px",display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setBadgeUser(null)}
                style={{padding:"9px 20px",borderRadius:10,border:"1.5px solid #e2e8f0",
                  background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#64748b"}}>
                Cancel
              </button>
              <button onClick={handleSaveBadge}
                style={{padding:"9px 20px",borderRadius:10,border:"none",
                  background:"linear-gradient(135deg,#5b21b6,#7c3aed)",
                  color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>
                Save Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DR({ icon, label, val }) {
  return (
    <div className="detail-row">
      <span className="d-icon">{icon}</span>
      <span className="d-key">{label}</span>
      <span className="d-val">{val}</span>
    </div>
  );
}

const S = {
   page: { minHeight:"100vh", background:"var(--bg)", padding:"24px",
    fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" },
  hero: { background:"var(--primary)",
    borderRadius:16, padding:"36px 40px", marginBottom:24 },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, marginBottom:10,
    fontSize:12, fontWeight:600, color:"rgba(255,255,255,.75)", letterSpacing:".1em" },
  heroTitle: { fontSize:28, fontWeight:700, color:"#fff", margin:"0 0 8px" },
  heroSub: { fontSize:14, color:"rgba(255,255,255,.7)", margin:0 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 },
  statCard: { background:"#fff", borderRadius:12, padding:"18px 20px",
    boxShadow:"0 1px 3px rgba(0,0,0,.06)" },
  tableSection: { background:"#fff", borderRadius:14,
    boxShadow:"0 1px 3px rgba(0,0,0,.06)", overflow:"hidden" },
  tableHeader: { padding:"20px 24px", borderBottom:"1px solid #f1f5f9",
    display:"flex", alignItems:"flex-start", justifyContent:"space-between",
    flexWrap:"wrap", gap:12 },
  tableTitle: { fontSize:16, fontWeight:600, color:"#1e293b" },
  tableCount: { fontSize:13, color:"#94a3b8", marginTop:2 },
  controls: { display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  filterRow: { display:"flex", gap:3, background:"var(--surface-soft)",
    border:"1px solid var(--border)", borderRadius:10, padding:3 },
  filterBtn: { padding:"5px 10px", borderRadius:8, border:"none",
    background:"transparent", cursor:"pointer", fontSize:12, color:"#64748b",
    fontWeight:500, display:"flex", alignItems:"center", gap:4 },
  filterActive: { background:"#fff", color:"var(--primary)", boxShadow:"0 1px 3px rgba(0,0,0,.1)" },
  filterCount: { fontSize:11, background:"var(--surface-soft)", borderRadius:99,
    padding:"1px 5px", color:"#64748b" },
  searchWrap: { position:"relative", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:10, fontSize:14, color:"#94a3b8", pointerEvents:"none" },
  searchInput: { paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7,
    border:"1px solid var(--border)", borderRadius:10, fontSize:13, color:"#1e293b",
    outline:"none", width:"min(190px, 100%)", background:"#fbfaf6" },
  errorBanner: { margin:"0 24px 16px", padding:"10px 14px",
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:8, color:"#dc2626", fontSize:13 },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"var(--surface-soft)" },
  th: { padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600,
    color:"#94a3b8", letterSpacing:".07em", borderBottom:"1px solid #f1f5f9" },
  tr: { borderBottom:"1px solid var(--surface-soft)" },
  td: { padding:"13px 16px", fontSize:14, color:"#334155", verticalAlign:"middle" },
  uName: { fontWeight:600, color:"#1e293b", fontSize:14 },
  uEmail: { fontSize:12, color:"#94a3b8", marginTop:2 },
  mono: { fontFamily:"monospace", fontSize:13 },
  dateText: { fontSize:13, color:"#64748b" },
  badge: { display:"inline-flex", alignItems:"center", gap:5, fontSize:11,
    fontWeight:600, padding:"3px 10px", borderRadius:99, textTransform:"capitalize" },
  dot: { width:5, height:5, borderRadius:"50%", display:"inline-block" },
  empty: { padding:48, textAlign:"center", color:"#94a3b8", fontSize:14 },
};
