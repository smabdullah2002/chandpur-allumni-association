import React, { useEffect, useState } from "react";
import {
  Award,
  Book,
  CheckCircle,
  ChevronDown,
  MapPin,
  Phone,
  PhoneOff,
  Star,
  Users,
} from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { trustPoints } from "../data/siteData";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const defaultStats = [
  { value: "100%", label: "স্বচ্ছ পরিচালনা" },
  { value: "24/7", label: "স্বেচ্ছাসেবক সমন্বয়" },
  { value: "1k+", label: "সম্প্রদায় পৌঁছানো" },
];
const defaultBody =
  "চাঁদপুর অ্যালামনাই অ্যাসোসিয়েশন একটি ঐক্যবদ্ধ, অরাজনৈতিক ও মানবিক সংগঠন, যেখানে বিভিন্ন প্রজন্মের প্রাক্তন শিক্ষার্থীরা সমাজের কল্যাণে একসাথে কাজ করে। শিক্ষা, মানবিক সহায়তা, সামাজিক উন্নয়ন ও দুর্যোগকালীন সহযোগিতার মাধ্যমে এই প্ল্যাটফর্ম মানুষের পাশে থাকার অঙ্গীকার বহন করে।";

/* ── Member grid ── */
function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/members`)
      .then(r => r.json())
      .then(d => { setMembers(d.members || []); setLoading(false); })
      .catch(() => { setError("তথ্য লোড করতে ব্যর্থ হয়েছে।"); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontFamily: "'Hind Siliguri',sans-serif" }}>
      লোড হচ্ছে…
    </div>
  );
  if (error) return (
    <div style={{ padding: "1.5rem", color: "#ef4444", fontFamily: "'Hind Siliguri',sans-serif" }}>{error}</div>
  );
  if (!members.length) return (
    <div style={{ padding: "1.5rem", color: "#b0aac8", fontStyle: "italic", fontFamily: "'Hind Siliguri',sans-serif" }}>
      এখনো কোনো সদস্য যোগ করা হয়নি।
    </div>
  );

  return (
    <div className="members-grid">
      {members.map(m => {
        const initials = m.fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div className="member-card" key={m.id}>
            <div className="member-avatar">
              {m.profileImage
                ? <img src={m.profileImage} alt={m.fullName} />
                : <span>{initials}</span>
              }
            </div>
            <div className="member-info">
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <p className="member-name" style={{margin:0}}>{m.fullName}</p>
                {m.badge && (
                  <span style={{
                    display:"inline-flex",alignItems:"center",padding:"1px 8px",
                    borderRadius:99,fontSize:10,fontWeight:700,lineHeight:1.6,
                    background:m.badge.color+"22",color:m.badge.color,
                    border:`1px solid ${m.badge.color}55`,whiteSpace:"nowrap",
                  }}>{m.badge.name}</span>
                )}
              </div>
              {(m.upazila || m.villageName) && (
                <p className="member-meta">
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                  {[m.villageName, m.upazila].filter(Boolean).join(", ")}
                </p>
              )}
              {m.lastEducation && (
                <p className="member-meta">
                  <Book size={11} style={{ flexShrink: 0 }} />
                  {m.lastEducation}
                </p>
              )}
              {m.phonePublic && m.mobileNumber ? (
                <p className="member-meta member-phone">
                  <Phone size={11} style={{ flexShrink: 0 }} />
                  {m.mobileNumber}
                </p>
              ) : (
                <p className="member-meta member-hidden">
                  <PhoneOff size={11} style={{ flexShrink: 0 }} />
                  গোপন
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ── */
export default function About() {
  const [content, setContent] = useState({
    title: "ভূমিকা",
    body: defaultBody,
    trustPoints,
    stats: defaultStats,
    lifetimeMembers: "",
    committee: "",
  });
  const [open, setOpen] = useState(null);

  useEffect(() => { fetchAbout(); }, []);

  async function fetchAbout() {
    try {
      const res = await fetch(`${apiBaseUrl}/api/about`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;
      const data = await res.json();
      if (data.about) {
        setContent({
          title: data.about.title || "ভূমিকা",
          body: data.about.body || defaultBody,
          trustPoints: data.about.trustPoints?.length ? data.about.trustPoints : trustPoints,
          stats: data.about.stats?.length ? data.about.stats : defaultStats,
          lifetimeMembers: data.about.lifetimeMembers || "",
          committee: data.about.committee || "",
        });
      }
    } catch (_) {}
  }

  function toggle(key) {
    setOpen(prev => prev === key ? null : key);
  }

  const CARDS = [
    { key: "members",         label: "সদস্যগণ",            icon: Users, color: "#5a4ef6", bg: "#eef1ff", live: true },
    { key: "lifetimeMembers", label: "আজীবন সদস্য",        icon: Star,  color: "#f59e0b", bg: "#fff8ec", live: false },
    { key: "committee",       label: "কার্যনির্বাহী পরিষদ", icon: Award, color: "#10b981", bg: "#edfcf3", live: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');

        .about-bengali { font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif; }

        .about-body-html {
          font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
          font-size: 1.06rem;
          line-height: 1.9;
          color: var(--muted);
        }
        .about-body-html div { margin-bottom: 0.15em; }

        .about-intro-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 720px) {
          .about-intro-grid { grid-template-columns: 1fr; }
          .about-stats-col { display: grid !important; grid-template-columns: repeat(3,1fr); gap: 0.6rem; }
        }

        .about-stat-card {
          background: var(--surface);
          border: 1.5px solid rgba(90,78,246,0.10);
          border-radius: 16px;
          padding: 1.1rem 0.9rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(90,78,246,0.06);
          min-width: 110px;
        }
        .about-stat-card strong { display:block; font-size:1.55rem; font-weight:800; color:var(--primary); line-height:1; margin-bottom:0.3rem; }
        .about-stat-card span { font-size:0.76rem; color:var(--muted); font-family:'Hind Siliguri',sans-serif; }

        .about-trust-list { display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem; }
        .about-trust-item { display:flex; align-items:flex-start; gap:0.55rem; font-size:0.9rem; color:var(--muted); font-family:'Hind Siliguri',sans-serif; }

        /* Accordion */
        .about-cards-section { display:flex; flex-direction:column; gap:0.85rem; margin-top:2.5rem; }

        .about-acc-card {
          background: var(--surface);
          border-radius: 18px;
          border: 1.5px solid rgba(148,163,184,0.18);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .about-acc-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); }

        .about-acc-header {
          display:flex; align-items:center; gap:1rem;
          padding:1rem 1.4rem;
          cursor:pointer; user-select:none;
          background:none; border:none; width:100%; text-align:left;
          transition:background 0.15s;
        }
        .about-acc-header:hover { background:rgba(0,0,0,0.018); }

        .about-acc-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:17px; }
        .about-acc-title { flex:1; font-size:1.05rem; font-weight:700; color:var(--ink); font-family:'Hind Siliguri',sans-serif; }
        .about-acc-chevron { color:var(--muted); transition:transform 0.25s ease; flex-shrink:0; }
        .about-acc-chevron.open { transform:rotate(180deg); }

        .about-acc-body { max-height:0; overflow:hidden; transition:max-height 0.38s ease; }
        .about-acc-body.open { max-height:9999px; }

        .about-acc-content {
          padding: 0.2rem 1.4rem 1.4rem;
          border-top: 1px solid rgba(148,163,184,0.12);
          font-family: 'Hind Siliguri','Noto Sans Bengali',sans-serif;
          font-size: 0.97rem; line-height: 1.9; color: var(--muted);
        }
        .about-acc-content div { margin-bottom: 0.1em; }
        .about-acc-empty {
          padding: 1.1rem 1.4rem;
          color: #b0aac8; font-size:0.88rem; font-style:italic;
          border-top:1px solid rgba(148,163,184,0.12);
          font-family:'Hind Siliguri',sans-serif;
        }

        /* Members grid */
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          padding: 0.4rem 1.4rem 1.4rem;
          border-top: 1px solid rgba(148,163,184,0.12);
        }
        @media (max-width: 500px) { .members-grid { grid-template-columns: repeat(2,1fr); } }

        .member-card {
          background: #f8f9ff;
          border: 1.5px solid rgba(90,78,246,0.08);
          border-radius: 14px;
          padding: 1rem 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.6rem;
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .member-card:hover { box-shadow: 0 6px 20px rgba(90,78,246,0.10); transform: translateY(-2px); }

        .member-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg,#5a4ef6,#7c6ef8);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; font-weight: 800; color: #fff;
          overflow: hidden; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(90,78,246,0.25);
        }
        .member-avatar img { width:100%; height:100%; object-fit:cover; }

        .member-name {
          font-family: 'Hind Siliguri',sans-serif;
          font-size: 0.95rem; font-weight: 700; color: var(--ink);
          margin: 0; line-height: 1.3;
        }
        .member-meta {
          display: flex; align-items: center; justify-content: center;
          gap: 0.3rem;
          font-family: 'Hind Siliguri',sans-serif;
          font-size: 0.78rem; color: var(--muted); margin: 0;
        }
        .member-phone { color: #10b981; font-weight: 600; }
        .member-hidden { color: #c4b5fd; font-size: 0.74rem; }
      `}</style>

      <section className="page-section page-band">
        <div className="container">

          {/* ── Intro ── */}
          <div className="about-intro-grid">
            <div>
              <SectionTitle eyebrow="About Us" title={content.title} align="left" />
              <div className="about-body-html" dangerouslySetInnerHTML={{ __html: content.body }} />
              {content.trustPoints.length > 0 && (
                <div className="about-trust-list">
                  {content.trustPoints.map((point, i) => (
                    <div key={i} className="about-trust-item">
                      <CheckCircle style={{ color: "var(--primary)", flexShrink: 0, marginTop: 3 }} />
                      <span dangerouslySetInnerHTML={{ __html: point }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="about-stats-col" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {content.stats.map((stat, i) => (
                <div className="about-stat-card" key={i}>
                  <strong>{stat.value}</strong>
                  <span className="about-bengali">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Three Expandable Cards ── */}
          <div className="about-cards-section">
            {CARDS.map(({ key, label, icon: Icon, color, bg, live }) => {
              const isOpen = open === key;
              const html = content[key];
              return (
                <div className="about-acc-card" key={key}>
                  <button className="about-acc-header" onClick={() => toggle(key)} aria-expanded={isOpen}>
                    <span className="about-acc-icon" style={{ background: bg, color }}>
                      <Icon />
                    </span>
                    <span className="about-acc-title">{label}</span>
                    <ChevronDown size={18} className={`about-acc-chevron${isOpen ? " open" : ""}`} />
                  </button>

                  <div className={`about-acc-body${isOpen ? " open" : ""}`}>
                    {live ? (
                      isOpen && <MembersList />
                    ) : html ? (
                      <div className="about-acc-content" dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                      <div className="about-acc-empty">এখনো কোনো তথ্য যোগ করা হয়নি।</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
