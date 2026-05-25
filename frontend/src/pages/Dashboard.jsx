import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart, FiBell, FiTrendingUp, FiShield,
  FiArrowRight, FiUsers, FiClock, FiAlertCircle, FiAward,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Dashboard = () => {
  const { auth } = useAuth();
  const name = auth?.user?.fullName || auth?.user?.email || "Friend";
  const firstName = name.split(" ")[0];
  const rawImage = auth?.user?.profileImage;
  const profileImageUrl = rawImage
    ? rawImage.startsWith("http") ? rawImage : `${apiBase}/uploads/${rawImage}`
    : "";
  const [stats, setStats] = useState({ total: 0, count: 0, approved: 0 });

  const memberSince = auth?.user?.createdAt
    ? new Date(auth.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  useEffect(() => {
    fetch(`${apiBase}/api/donations/mine`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const total    = data.reduce((s, d) => s + Number(d.amount || 0), 0);
        const approved = data.filter(d => d.status === "approved").length;
        setStats({ total, count: data.length, approved });
      })
      .catch(() => {});
  }, [auth.token]);

  const heroMessage = stats.count === 0
    ? `You haven't donated yet, ${firstName} — but you're already part of this family. Whenever you're ready, we're here.`
    : stats.count === 1
    ? `Your very first donation made a difference, ${firstName}. Thank you for taking that step.`
    : `${firstName}, your generosity has shown up ${stats.count} times for this community. That means everything to us.`;

  const cards = [
    {
      icon: <FiHeart />,
      iconBg: "#eef1ff", iconColor: "#3b4fd8", accentColor: "#3b4fd8",
      title: "My Contributions",
      description: "Every donation you've made is saved here. See your history, track approvals, and feel proud of what you've given.",
      link: "/donations", linkLabel: "See My Giving",
    },
    {
      icon: <FiBell />,
      iconBg: "#fff8ec", iconColor: "#f59e0b", accentColor: "#f59e0b",
      title: "Notices",
      description: "Stay in the loop with what's happening in your community — announcements, reminders, and updates written just for you.",
      link: "/notice", linkLabel: "Read Notices",
    },
    {
      icon: <FiUsers />,
      iconBg: "#edfcf3", iconColor: "#10b981", accentColor: "#10b981",
      title: "Community Events",
      description: "Come together. See what your neighbors are planning — outreach days, fundraisers, and moments worth showing up for.",
      link: "/events", linkLabel: "Join an Event",
    },
    {
      icon: <FiTrendingUp />,
      iconBg: "#fdf2f8", iconColor: "#a855f7", accentColor: "#a855f7",
      title: "Give Again",
      description: "A little goes a long way. Submit a new donation, upload your receipt, and let your contribution be counted.",
      link: "/donations/new", linkLabel: "Donate Now",
    },
  ];

  const userStatus = auth?.user?.status;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)",
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .dash-root * { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; }
        .dash-hero {
          background: linear-gradient(135deg, #1a1f6e 0%, #2d3282 40%, #3b4fd8 100%);
          border-radius: 24px; padding: 44px 48px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(45,50,130,0.35);
        }
        .dash-hero::before { content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; background:rgba(255,255,255,0.05); border-radius:50%; }
        .dash-hero::after  { content:''; position:absolute; bottom:-60px; right:160px; width:160px; height:160px; background:rgba(255,255,255,0.04); border-radius:50%; }
        .avatar-ring { width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.15); border:2.5px solid rgba(255,255,255,0.35); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:#fff; flex-shrink:0; backdrop-filter:blur(8px); overflow:hidden; }
        .avatar-ring img { width:100%; height:100%; object-fit:cover; }
        .verified-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#6ee7b7; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
        .stat-strip { display:flex; gap:28px; margin-top:32px; position:relative; z-index:1; }
        .strip-item { display:flex; flex-direction:column; gap:5px; }
        .strip-val { font-size:24px; font-weight:800; color:#fff; }
        .strip-label { font-size:11px; font-weight:600; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.08em; }
        .strip-divider { width:1px; background:rgba(255,255,255,0.15); align-self:stretch; }
        .impact-banner { background:#fff; border-radius:18px; border:1.5px solid #e8edff; padding:20px 24px; display:flex; align-items:center; gap:16px; box-shadow:0 2px 12px rgba(59,79,216,0.07); }
        .impact-icon { width:44px; height:44px; border-radius:14px; background:#eef1ff; color:#3b4fd8; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .dash-card { background:#fff; border-radius:20px; border:1.5px solid #f1f5f9; box-shadow:0 2px 16px rgba(0,0,0,0.05); padding:28px; display:flex; flex-direction:column; gap:16px; transition:all 0.25s ease; position:relative; overflow:hidden; }
        .dash-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent); transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; border-radius:20px 20px 0 0; }
        .dash-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.12); border-color:#e0e7ff; }
        .dash-card:hover::after { transform:scaleX(1); }
        .card-icon-wrap { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .card-link { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:700; text-decoration:none; padding:10px 18px; border-radius:10px; transition:all 0.2s ease; align-self:flex-start; margin-top:auto; }
        .card-link:hover { gap:12px; }
        .cards-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .member-chip { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.75); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:0.05em; backdrop-filter:blur(4px); }
        .section-header { display:flex; align-items:center; gap:10px; }
        .section-dot { width:8px; height:8px; border-radius:50%; background:#3b4fd8; }
        @media(max-width:640px){
          .dash-hero { padding:28px 20px; }
          .cards-grid { grid-template-columns:1fr; }
          .stat-strip { gap:16px; }
          .hero-top-row { flex-direction:column; align-items:flex-start; gap:12px; }
        }
      `}</style>

      <div className="dash-root" style={{ maxWidth:900, margin:"0 auto", padding:"40px 20px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Hero */}
        <div className="dash-hero">
          <div style={{ position:"relative", zIndex:1 }}>
            <div className="hero-top-row" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div className="avatar-ring">
                  {profileImageUrl
                    ? <img src={profileImageUrl} alt={name} onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }}/>
                    : null}
                  <span style={{ display: profileImageUrl ? "none" : "flex" }}>{firstName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 6px", lineHeight:1.2 }}>{name}</h1>
                  {memberSince && (
                    <div className="member-chip">
                      Member since {memberSince}
                    </div>
                  )}
                </div>
              </div>
              {userStatus === "approved" ? (
                <div className="verified-badge">
                  <FiShield style={{ fontSize:12 }}/> Verified
                </div>
              ) : userStatus === "rejected" ? (
                <div className="verified-badge" style={{ background:"rgba(239,68,68,0.2)", borderColor:"rgba(239,68,68,0.4)", color:"#fca5a5" }}>
                  <FiAlertCircle style={{ fontSize:12 }}/> Rejected
                </div>
              ) : (
                <div className="verified-badge" style={{ background:"rgba(245,158,11,0.2)", borderColor:"rgba(245,158,11,0.4)", color:"#fcd34d" }}>
                  <FiClock style={{ fontSize:12 }}/> Pending
                </div>
              )}
            </div>

            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:14, margin:0, lineHeight:1.7, maxWidth:520 }}>
              {heroMessage}
            </p>

            <div className="stat-strip">
              <div className="strip-item">
                <span className="strip-val">৳{stats.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span className="strip-label">You've Given</span>
              </div>
              <div className="strip-divider"/>
              <div className="strip-item">
                <span className="strip-val">{stats.count}</span>
                <span className="strip-label">Acts of Giving</span>
              </div>
              <div className="strip-divider"/>
              <div className="strip-item">
                <span className="strip-val">{stats.approved}</span>
                <span className="strip-label">Verified Gifts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact banner — only shown once they've donated */}
        {stats.count > 0 && (
          <div className="impact-banner">
            <div className="impact-icon"><FiAward /></div>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#0f172a" }}>
                {stats.approved > 0
                  ? `${stats.approved} of your donation${stats.approved > 1 ? "s have" : " has"} been verified by the community.`
                  : "Your donations are being reviewed by the admin team."}
              </p>
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#64748b" }}>
                Every verified gift goes directly to the people who need it most.
              </p>
            </div>
          </div>
        )}

        {/* Section label */}
        <div className="section-header">
          <div className="section-dot"/>
          <span style={{ fontSize:12, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            What would you like to do?
          </span>
        </div>

        {/* Cards */}
        <div className="cards-grid">
          {cards.map(card => (
            <div key={card.title} className="dash-card" style={{ "--accent": card.accentColor }}>
              <div className="card-icon-wrap" style={{ background:card.iconBg, color:card.iconColor }}>
                {card.icon}
              </div>
              <div>
                <h2 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 7px" }}>{card.title}</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:0, lineHeight:1.7 }}>{card.description}</p>
              </div>
              <Link to={card.link} className="card-link" style={{ background:card.iconBg, color:card.iconColor }}>
                {card.linkLabel}
                <FiArrowRight style={{ fontSize:13 }}/>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p style={{ textAlign:"center", fontSize:12, color:"#94a3b8", margin:"4px 0 0", lineHeight:1.8 }}>
          মননে মতলব — built on trust, run by community, powered by people like you.
        </p>

      </div>
    </div>
  );
};

export default Dashboard;
