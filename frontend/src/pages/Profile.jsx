import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiUser, FiShield, FiAlertTriangle, FiMail, FiCalendar,
  FiPhone, FiMapPin, FiBook, FiHome, FiEdit2, FiCheck,
  FiLock, FiCamera, FiCheckCircle, FiAward, FiUpload,
  FiX, FiDownload, FiEye, FiEyeOff, FiFileText,
} from "react-icons/fi";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Profile = () => {
  const { auth, setAuth } = useAuth();
  const user = auth?.user;

  const profileImageUrl = user?.profileImage
    ? (user.profileImage.startsWith("http") ? user.profileImage : `${apiBase}/uploads/${user.profileImage}`)
    : "";
  const certificateUrl = user?.certificateDocument
    ? (user.certificateDocument.startsWith("http") ? user.certificateDocument : `${apiBase}/uploads/${user.certificateDocument}`)
    : "";
  const nidUrl = user?.nidDocument
    ? (user.nidDocument.startsWith("http") ? user.nidDocument : `${apiBase}/uploads/${user.nidDocument}`)
    : "";

  const [activeTab, setActiveTab]     = useState("profile");
  const [fullName, setFullName]       = useState(user?.fullName || "");
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profileImageUrl || null);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState(null); // {type: "success"|"error", text}
  const [pwdForm, setPwdForm]         = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg]           = useState(null);
  const [pwdSaving, setPwdSaving]     = useState(false);
  const [phonePublic, setPhonePublic] = useState(user?.phonePublic ?? false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMsg, setPrivacyMsg]   = useState(null);
  const [docModal, setDocModal]       = useState(null); // { url, label, isPdf }
  const [showPwds, setShowPwds]       = useState({ current: false, next: false, confirm: false });
  const fileRef = useRef();

  const isPdf = (url) => url && url.toLowerCase().includes(".pdf");

  const getDownloadUrl = (url) => {
    if (!url) return url;
    // Cloudinary: insert fl_attachment to force browser download
    if (url.includes("cloudinary.com")) return url.replace("/upload/", "/upload/fl_attachment/");
    return url;
  };

  function openDoc(url, label) {
    setDocModal({ url, label, isPdf: isPdf(url) });
  }

  useEffect(() => {
    if (!photoFile) setPhotoPreview(profileImageUrl || null);
  }, [profileImageUrl]);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const personalInfo = [
    { icon: <FiCalendar />, label: "Date of Birth",     value: user?.dateOfBirth,       color: "#3b4fd8" },
    { icon: <FiPhone />,    label: "Mobile Number",     value: user?.mobileNumber,      color: "#10b981" },
    { icon: <FiMapPin />,   label: "District",          value: user?.district,          color: "#f59e0b" },
    { icon: <FiMapPin />,   label: "Upazila",           value: user?.upazila,           color: "#3b4fd8" },
    { icon: <FiMapPin />,   label: "Village",           value: user?.villageName,       color: "#6d35e8" },
    { icon: <FiShield />,   label: "Police Station",    value: user?.policeStation,     color: "#6d35e8" },
    { icon: <FiBook />,     label: "Education",         value: user?.lastEducation,     color: "#10b981" },
    { icon: <FiHome />,     label: "Present Address",   value: user?.presentAddress,    color: "#ef4444" },
    { icon: <FiUser />,     label: "Permanent Address", value: user?.permanentAddress,  color: "#6d35e8" },
  ];

  function handlePhoto(file) {
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      if (photoFile) fd.append("profileImage", photoFile);

      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      // Update auth context with new user data
      setAuth(prev => ({ ...prev, user: data.user }));
      setPhotoFile(null);
      setSaveMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setSaveMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) {
      return setPwdMsg({ type: "error", text: "New passwords do not match" });
    }
    if (pwdForm.next.length < 8) {
      return setPwdMsg({ type: "error", text: "Password must be at least 8 characters" });
    }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      setPwdMsg({ type: "success", text: "Password updated successfully!" });
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwdMsg({ type: "error", text: err.message });
    } finally {
      setPwdSaving(false);
    }
  }

  async function handlePrivacyToggle(newValue) {
    setPrivacySaving(true);
    setPrivacyMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/privacy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ phonePublic: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update privacy");
      setPhonePublic(newValue);
      setAuth(prev => ({ ...prev, user: data.user }));
      setPrivacyMsg({ type: "success", text: newValue ? "ফোন নম্বর এখন সবার কাছে দৃশ্যমান।" : "ফোন নম্বর এখন গোপন করা হয়েছে।" });
      setTimeout(() => setPrivacyMsg(null), 3000);
    } catch (err) {
      setPrivacyMsg({ type: "error", text: err.message });
    } finally {
      setPrivacySaving(false);
    }
  }

  const initials = (user?.fullName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif", background:"#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .prof-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .prof-hero { background:linear-gradient(160deg,#0f1340 0%,#1a1f6e 45%,#2a3190 100%); padding:56px 0 80px; position:relative; overflow:hidden; }
        .prof-hero::before { content:''; position:absolute; top:-100px; right:-100px; width:360px; height:360px; background:rgba(255,255,255,0.04); border-radius:50%; }
        .hero-inner { max-width:1000px; margin:0 auto; padding:0 32px; display:flex; align-items:center; gap:28px; position:relative; z-index:1; }
        .avatar-frame { width:110px; height:110px; border-radius:20px; border:3px solid rgba(255,255,255,0.2); overflow:hidden; flex-shrink:0; background:linear-gradient(135deg,#3b4fd8,#6d35e8); display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:800; color:#fff; position:relative; box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        .avatar-frame img { width:100%; height:100%; object-fit:cover; }
        .online-dot { position:absolute; bottom:8px; right:8px; width:14px; height:14px; border-radius:50%; background:#10b981; border:2px solid #1a1f6e; }
        .hero-meta h1 { font-size:34px; font-weight:800; color:#fff; margin:0 0 6px; }
        .hero-meta p { font-size:14px; color:rgba(255,255,255,0.55); margin:0 0 16px; }
        .chip-row { display:flex; flex-wrap:wrap; gap:10px; }
        .chip { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,0.12); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.88); padding:7px 14px; border-radius:20px; font-size:12px; font-weight:600; }
        .chip.role { background:rgba(109,53,232,0.4); border-color:rgba(109,53,232,0.5); }
        .tabs-bar { max-width:1000px; margin:-28px auto 0; padding:0 32px; position:relative; z-index:2; }
        .tabs-pill { display:inline-flex; background:#fff; border-radius:16px; padding:6px; box-shadow:0 4px 24px rgba(0,0,0,0.10); gap:2px; }
        .tab-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:12px; font-size:14px; font-weight:600; color:#64748b; background:none; border:none; cursor:pointer; transition:all .2s; }
        .tab-btn:hover { color:#1e293b; background:#f8fafc; }
        .tab-btn.active { background:#1a1f6e; color:#fff; box-shadow:0 4px 16px rgba(26,31,110,0.3); }
        .tab-btn.danger:hover { color:#ef4444; }
        .tab-btn.danger.active { background:#ef4444; color:#fff; }
        .prof-body { max-width:1000px; margin:32px auto 60px; padding:0 32px; display:flex; flex-direction:column; gap:24px; }
        .section-card { background:#fff; border-radius:20px; border:1px solid #e8ecf7; box-shadow:0 2px 16px rgba(0,0,0,0.05); overflow:hidden; }
        .card-header { padding:24px 28px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9; }
        .card-header-left { display:flex; align-items:center; gap:14px; }
        .card-icon { width:44px; height:44px; border-radius:12px; background:#eef1ff; display:flex; align-items:center; justify-content:center; font-size:18px; color:#3b4fd8; flex-shrink:0; }
        .card-icon.green { background:#edfcf3; color:#10b981; }
        .card-icon.purple { background:#f3eeff; color:#6d35e8; }
        .card-title { font-size:17px; font-weight:800; color:#0f172a; margin:0 0 2px; }
        .card-sub { font-size:13px; color:#94a3b8; margin:0; }
        .card-body { padding:28px; }
        .field-label { display:block; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#94a3b8; margin-bottom:8px; }
        .field-input { width:100%; padding:13px 16px; border-radius:12px; border:1.5px solid #e8e5f7; background:#f8f7ff; font-size:14px; color:#1a1235; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; }
        .field-input:focus { border-color:#3b4fd8; box-shadow:0 0 0 3px rgba(59,79,216,0.10); background:#fff; }
        .field-input:disabled { background:#f1f5f9; color:#94a3b8; cursor:not-allowed; }
        .managed-note { display:flex; align-items:center; gap:5px; font-size:12px; color:#94a3b8; margin-top:6px; }
        .photo-row { display:flex; align-items:center; gap:20px; background:#f8f7ff; border:1.5px solid #e8e5f7; border-radius:14px; padding:16px 20px; }
        .photo-thumb { width:64px; height:64px; border-radius:12px; background:linear-gradient(135deg,#3b4fd8,#6d35e8); display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; color:#fff; overflow:hidden; flex-shrink:0; }
        .photo-thumb img { width:100%; height:100%; object-fit:cover; }
        .choose-btn { padding:8px 16px; border-radius:10px; border:1.5px solid #e8e5f7; background:#fff; font-size:13px; font-weight:600; color:#475569; cursor:pointer; transition:all .2s; }
        .choose-btn:hover { border-color:#3b4fd8; color:#3b4fd8; }
        .photo-hint { font-size:12px; color:#94a3b8; margin-top:6px; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .save-btn { display:inline-flex; align-items:center; gap:9px; background:#0f1340; color:#fff; border:none; border-radius:12px; padding:13px 28px; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(15,19,64,0.3); transition:all .22s; }
        .save-btn:hover { transform:translateY(-2px); }
        .save-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .save-btn.success { background:#10b981; }
        .info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:28px; }
        .info-tile { background:#f8fafc; border-radius:14px; padding:20px; border:1px solid #f1f5f9; transition:all .2s; }
        .info-tile:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); transform:translateY(-2px); }
        .tile-icon { font-size:18px; margin-bottom:10px; }
        .tile-label { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94a3b8; margin:0 0 6px; }
        .tile-value { font-size:15px; font-weight:700; color:#0f172a; margin:0; }
        .docs-row { display:grid; grid-template-columns:1fr 1px 1fr; }
        .doc-section { padding:28px; }
        .doc-label { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94a3b8; margin-bottom:14px; }
        .doc-img-wrap { position:relative; display:inline-block; }
        .doc-img { width:130px; height:100px; border-radius:10px; object-fit:cover; border:2px solid #e8ecf7; }
        .doc-zoom { position:absolute; bottom:6px; right:6px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.9); display:flex; align-items:center; justify-content:center; font-size:13px; color:#475569; box-shadow:0 2px 8px rgba(0,0,0,0.15); cursor:pointer; }
        .verified-badge { display:inline-flex; align-items:center; gap:5px; background:#edfcf3; border:1.5px solid #86efac; color:#16a34a; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
        .doc-divider { width:1px; background:#f1f5f9; }
        .ethics-card { background:linear-gradient(135deg,#0f1340 0%,#1a1f6e 100%); border-radius:20px; padding:28px 32px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 8px 32px rgba(15,19,64,0.35); }
        .ethics-left { display:flex; align-items:center; gap:16px; }
        .ethics-icon { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; }
        .auth-pill { display:inline-flex; align-items:center; gap:7px; background:rgba(109,53,232,0.35); border:1px solid rgba(109,53,232,0.4); color:#d8b4fe; padding:9px 20px; border-radius:20px; font-size:13px; font-weight:700; }
        .pwd-form { padding:28px; display:flex; flex-direction:column; gap:20px; max-width:480px; }
        .msg-banner { padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; }
        .msg-success { background:#edfcf3; border:1px solid #86efac; color:#16a34a; }
        .msg-error { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; }
        .danger-zone { padding:28px; }
        .danger-item { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-radius:14px; border:1.5px solid #fee2e2; background:#fff5f5; }
        .danger-btn { padding:9px 20px; border-radius:10px; background:#ef4444; color:#fff; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
        .danger-btn:hover { background:#dc2626; }
        /* Privacy toggle */
        .privacy-row { display:flex; align-items:center; justify-content:space-between; padding:20px 28px; gap:20px; }
        .toggle-track { width:48px; height:26px; border-radius:13px; background:#e2e8f0; border:none; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; padding:0; }
        .toggle-track.on { background:#10b981; }
        .toggle-track.saving { opacity:.6; cursor:not-allowed; }
        .toggle-thumb { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left .2s; }
        .toggle-track.on .toggle-thumb { left:25px; }
        /* Document cards */
        .doc-card { padding:24px; }
        .doc-preview { width:100%; height:180px; border-radius:14px; overflow:hidden; border:1.5px solid #e8ecf7; background:#f8fafc; display:flex; align-items:center; justify-content:center; margin-bottom:16px; cursor:pointer; transition:box-shadow .2s,border-color .2s; }
        .doc-preview:hover { box-shadow:0 4px 20px rgba(59,79,216,0.14); border-color:#3b4fd8; }
        .doc-preview img { width:100%; height:100%; object-fit:cover; }
        .doc-pdf-placeholder { display:flex; flex-direction:column; align-items:center; gap:10px; color:#94a3b8; }
        .doc-pdf-placeholder span { font-size:12px; font-weight:600; }
        .doc-actions { display:flex; gap:10px; }
        .doc-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:1.5px solid #e2e8f0; background:#fff; color:#475569; transition:all .2s; text-decoration:none; }
        .doc-btn:hover { border-color:#3b4fd8; color:#3b4fd8; }
        .doc-btn.primary { background:#3b4fd8; color:#fff; border-color:#3b4fd8; }
        .doc-btn.primary:hover { background:#2a3db8; border-color:#2a3db8; }
        /* Doc viewer modal */
        .doc-overlay { position:fixed; inset:0; background:rgba(0,0,0,.78); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; backdrop-filter:blur(6px); }
        .doc-modal { background:#fff; border-radius:20px; width:min(92vw,820px); max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 28px 64px rgba(0,0,0,.45); }
        .doc-modal-hd { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #f1f5f9; flex-shrink:0; }
        .doc-modal-hd-title { font-weight:800; font-size:16px; color:#0f172a; }
        .doc-modal-close { background:#f1f5f9; border:none; width:34px; height:34px; border-radius:9px; cursor:pointer; display:grid; place-items:center; color:#475569; font-size:1rem; transition:background .2s; }
        .doc-modal-close:hover { background:#e2e8f0; }
        .doc-modal-body { flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; padding:24px; background:#f8fafc; }
        .doc-modal-img { max-width:100%; max-height:68vh; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,.18); }
        .doc-modal-iframe { width:100%; height:68vh; border:none; border-radius:10px; }
        .doc-modal-ft { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #f1f5f9; flex-shrink:0; }
        @media(max-width:768px){
          .hero-inner { flex-direction:column; align-items:flex-start; }
          .info-grid { grid-template-columns:1fr 1fr; }
          .docs-row { grid-template-columns:1fr; }
          .form-grid { grid-template-columns:1fr; }
          .prof-body,.tabs-bar,.hero-inner { padding:0 16px; }
        }
      `}</style>

      <div className="prof-root">
        {/* Hero */}
        <div className="prof-hero">
          <div className="hero-inner">
            <div className="avatar-frame">
              {photoPreview ? <img src={photoPreview} alt="avatar"/> : initials}
              <div className="online-dot"/>
            </div>
            <div className="hero-meta">
              <h1>{user?.fullName || "User"}</h1>
              <p>Manage your profile and account settings</p>
              <div className="chip-row">
                <span className="chip role">
                  <FiShield style={{fontSize:12}}/> {user?.role?.toUpperCase() || "MEMBER"}
                </span>
                <span className="chip">
                  <FiMail style={{fontSize:12}}/> {user?.email}
                </span>
                {joinedDate && (
                  <span className="chip">
                    <FiCalendar style={{fontSize:12}}/> Joined {joinedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-bar">
          <div className="tabs-pill">
            {[
              { id:"profile",  label:"Profile",     icon:<FiUser/> },
              { id:"security", label:"Security",    icon:<FiShield/> },
              { id:"danger",   label:"Danger Zone", icon:<FiAlertTriangle/>, danger:true },
            ].map(t => (
              <button key={t.id}
                className={`tab-btn${t.danger?" danger":""}${activeTab===t.id?" active":""}`}
                onClick={()=>setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="prof-body">

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <>
              {/* Account Details */}
              <div className="section-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon"><FiUser/></div>
                    <div>
                      <p className="card-title">Account Details</p>
                      <p className="card-sub">Update your name and profile photo</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div>
                      <label className="field-label">Full Name</label>
                      <input className="field-input" value={fullName}
                        onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/>
                    </div>
                    <div>
                      <label className="field-label">Email Address</label>
                      <input className="field-input" value={user?.email||""} disabled/>
                      <div className="managed-note">
                        <FiLock style={{fontSize:11}}/> Managed by administration
                      </div>
                    </div>
                  </div>

                  <div style={{marginBottom:24}}>
                    <label className="field-label">Profile Photo</label>
                    <div className="photo-row">
                      <div className="photo-thumb">
                        {photoPreview ? <img src={photoPreview} alt=""/> : initials}
                      </div>
                      <div>
                        <button className="choose-btn" onClick={()=>fileRef.current.click()}>
                          <FiCamera style={{marginRight:6, verticalAlign:"middle"}}/>
                          Choose Photo
                        </button>
                        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg"
                          style={{display:"none"}}
                          onChange={e=>handlePhoto(e.target.files[0])}/>
                        <p className="photo-hint">
                          {photoFile ? photoFile.name : "No file chosen"} — PNG or JPG, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {saveMsg && (
                    <div className={`msg-banner ${saveMsg.type==="success"?"msg-success":"msg-error"}`}
                      style={{marginBottom:16}}>
                      {saveMsg.type==="success" ? <FiCheckCircle/> : <FiX/>}
                      {saveMsg.text}
                    </div>
                  )}

                  <button className={`save-btn${saveMsg?.type==="success"?" success":""}`}
                    onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : saveMsg?.type==="success"
                      ? <><FiCheckCircle/> Saved!</>
                      : <><FiCheck/> Save Changes</>}
                  </button>
                </div>
              </div>

              {/* Personal Info */}
              <div className="section-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon purple"><FiUser/></div>
                    <div>
                      <p className="card-title">Personal Information</p>
                      <p className="card-sub">Your registered details on file</p>
                    </div>
                  </div>
                </div>
                <div className="info-grid">
                  {personalInfo.map(item => (
                    <div className="info-tile" key={item.label}>
                      <div className="tile-icon" style={{color:item.color}}>{item.icon}</div>
                      <p className="tile-label">{item.label}</p>
                      <p className="tile-value">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="section-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon" style={{background:"#edfcf3",color:"#10b981"}}><FiPhone/></div>
                    <div>
                      <p className="card-title">গোপনীয়তা সেটিংস</p>
                      <p className="card-sub">নিয়ন্ত্রণ করুন কোন তথ্য অন্য সদস্যরা দেখতে পাবেন</p>
                    </div>
                  </div>
                </div>
                <div className="privacy-row">
                  <div>
                    <p style={{fontWeight:700,color:"#0f172a",margin:"0 0 3px",fontSize:14}}>
                      ফোন নম্বর প্রকাশ করুন
                    </p>
                    <p style={{fontSize:12,color:"#64748b",margin:0}}>
                      চালু করলে About পেজে সদস্য তালিকায় আপনার নম্বর দেখা যাবে
                    </p>
                    {privacyMsg && (
                      <p style={{fontSize:12,margin:"6px 0 0",color:privacyMsg.type==="success"?"#10b981":"#ef4444",fontWeight:600}}>
                        {privacyMsg.text}
                      </p>
                    )}
                  </div>
                  <button
                    className={`toggle-track${phonePublic?" on":""}${privacySaving?" saving":""}`}
                    onClick={() => !privacySaving && handlePrivacyToggle(!phonePublic)}
                    aria-label="Toggle phone number visibility"
                  >
                    <span className="toggle-thumb"/>
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="section-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon green"><FiFileText/></div>
                    <div>
                      <p className="card-title">Submitted Documents</p>
                      <p className="card-sub">Click to view or download your files</p>
                    </div>
                  </div>
                </div>
                <div className="docs-row">
                  {/* Certificate */}
                  <div className="doc-card">
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div className="card-icon green" style={{width:36,height:36,fontSize:15}}><FiBook/></div>
                      <div>
                        <p style={{margin:0,fontWeight:800,fontSize:14,color:"#0f172a"}}>Certificate Document</p>
                        <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>Academic record</p>
                      </div>
                    </div>
                    {certificateUrl ? (
                      <>
                        <div className="doc-preview" onClick={() => openDoc(certificateUrl, "Certificate Document")}>
                          {isPdf(certificateUrl)
                            ? <div className="doc-pdf-placeholder"><FiFileText style={{fontSize:48,color:"#3b4fd8"}}/><span>PDF Document</span></div>
                            : <img src={certificateUrl} alt="Certificate"/>}
                        </div>
                        <div className="doc-actions">
                          <button className="doc-btn primary" onClick={() => openDoc(certificateUrl, "Certificate Document")}>
                            <FiEye/> View
                          </button>
                          <a className="doc-btn" href={getDownloadUrl(certificateUrl)} target="_blank" rel="noopener noreferrer" download>
                            <FiDownload/> Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="doc-preview" style={{cursor:"default"}}>
                        <div className="doc-pdf-placeholder"><FiUpload style={{fontSize:36}}/><span>Not uploaded</span></div>
                      </div>
                    )}
                  </div>

                  <div className="doc-divider"/>

                  {/* NID */}
                  <div className="doc-card">
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div className="card-icon purple" style={{width:36,height:36,fontSize:15}}><FiShield/></div>
                      <div>
                        <p style={{margin:0,fontWeight:800,fontSize:14,color:"#0f172a"}}>NID Document</p>
                        <span className="verified-badge" style={{marginTop:3,display:"inline-flex"}}>
                          <FiCheckCircle style={{fontSize:10}}/> VERIFIED
                        </span>
                      </div>
                    </div>
                    {nidUrl ? (
                      <>
                        <div className="doc-preview" onClick={() => openDoc(nidUrl, "NID Document")}>
                          {isPdf(nidUrl)
                            ? <div className="doc-pdf-placeholder"><FiFileText style={{fontSize:48,color:"#6d35e8"}}/><span>PDF Document</span></div>
                            : <img src={nidUrl} alt="NID"/>}
                        </div>
                        <div className="doc-actions">
                          <button className="doc-btn primary" onClick={() => openDoc(nidUrl, "NID Document")}>
                            <FiEye/> View
                          </button>
                          <a className="doc-btn" href={getDownloadUrl(nidUrl)} target="_blank" rel="noopener noreferrer" download>
                            <FiDownload/> Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="doc-preview" style={{cursor:"default"}}>
                        <div className="doc-pdf-placeholder"><FiUpload style={{fontSize:36}}/><span>Not uploaded</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ethical Commitment */}
              <div className="ethics-card">
                <div className="ethics-left">
                  <div className="ethics-icon"><FiAward/></div>
                  <div>
                    <p style={{fontWeight:800,fontSize:17,color:"#fff",margin:"0 0 4px"}}>
                      Ethical Commitment
                    </p>
                    <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",margin:0}}>
                      Confirms adherence to organizational standards
                    </p>
                  </div>
                </div>
                <span className="auth-pill">
                  <FiCheck style={{fontSize:13}}/> Authorized
                </span>
              </div>
            </>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "security" && (
            <div className="section-card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-icon"><FiShield/></div>
                  <div>
                    <p className="card-title">Change Password</p>
                    <p className="card-sub">Keep your account secure with a strong password</p>
                  </div>
                </div>
              </div>
              <div className="pwd-form">
                {[
                  { label:"Current Password", key:"current" },
                  { label:"New Password",     key:"next" },
                  { label:"Confirm New Password", key:"confirm" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="field-label">{f.label}</label>
                    <div className="pwd-wrap">
                      <input type={showPwds[f.key] ? "text" : "password"} className="field-input"
                        placeholder="••••••••" value={pwdForm[f.key]}
                        onChange={e=>setPwdForm({...pwdForm,[f.key]:e.target.value})}/>
                      <button type="button" className="pwd-eye"
                        onClick={()=>setShowPwds(p=>({...p,[f.key]:!p[f.key]}))}
                        aria-label={showPwds[f.key]?"Hide password":"Show password"}>
                        {showPwds[f.key] ? <FiEyeOff/> : <FiEye/>}
                      </button>
                    </div>
                  </div>
                ))}
                {pwdMsg && (
                  <div className={`msg-banner ${pwdMsg.type==="success"?"msg-success":"msg-error"}`}>
                    {pwdMsg.type==="success" ? <FiCheckCircle/> : <FiX/>}
                    {pwdMsg.text}
                  </div>
                )}
                <button className={`save-btn${pwdMsg?.type==="success"?" success":""}`}
                  style={{alignSelf:"flex-start"}} onClick={handlePasswordChange}
                  disabled={pwdSaving}>
                  <FiLock/> {pwdSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE TAB ── */}
          {activeTab === "danger" && (
            <div className="section-card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-icon" style={{background:"#fee2e2",color:"#ef4444"}}>
                    <FiAlertTriangle/>
                  </div>
                  <div>
                    <p className="card-title">Danger Zone</p>
                    <p className="card-sub">Irreversible and destructive actions</p>
                  </div>
                </div>
              </div>
              <div className="danger-zone">
                <div className="danger-item">
                  <div>
                    <p style={{fontWeight:700,color:"#0f172a",margin:"0 0 4px"}}>Delete Account</p>
                    <p style={{fontSize:13,color:"#64748b",margin:0}}>
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                  </div>
                  <button className="danger-btn">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {docModal && (
        <div className="doc-overlay" onClick={() => setDocModal(null)}>
          <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-hd">
              <span className="doc-modal-hd-title">{docModal.label}</span>
              <button className="doc-modal-close" onClick={() => setDocModal(null)} aria-label="Close">
                <FiX/>
              </button>
            </div>
            <div className="doc-modal-body">
              {docModal.isPdf
                ? <iframe src={docModal.url} title={docModal.label} className="doc-modal-iframe"/>
                : <img src={docModal.url} alt={docModal.label} className="doc-modal-img"/>}
            </div>
            <div className="doc-modal-ft">
              <button className="doc-btn" onClick={() => setDocModal(null)}>
                <FiX/> Close
              </button>
              <a className="doc-btn primary" href={getDownloadUrl(docModal.url)} target="_blank" rel="noopener noreferrer" download>
                <FiDownload/> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;