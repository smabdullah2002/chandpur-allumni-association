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
import MembersList from "../components/MembersList";
import { useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// stats removed — UI no longer displays numeric stat cards

const defaultTrustPoints = [
  "আলুমনাই ও বিশ্ববিদ্যালয়ের মধ্যে ধারাবাহিক সংযোগ রক্ষা করে।",
  "পেশাগত উন্নয়ন ও মেন্টরশিপ প্রোগ্রাম পরিচালনা করা।",
  "শিক্ষা, সামাজিক সেবা ও দাতব্য কার্যক্রমে অংশগ্রহণ বাড়ানো।",
  "পুনর্মিলনী, নেটওয়ার্কিং সেশন এবং জ্ঞানের বিনিময় ফোরাম আয়োজন করা।",
];

const defaultBody = `
<div>
  <p>
    চাঁদপুর অ্যালামনাই অ্যাসোসিয়েশন (CAA) হচ্ছে আমাদের বিশ্ববিদ্যালয়ের সকল স্নাতক ও স্নাতকোত্তর শিক্ষার্থীদের প্রতিনিধিত্বকারী দেহ। এই সংগঠনটি বিশ্ববিদ্যালয় ও তার প্রাক্তন শিক্ষার্থীদের মধ্যে একটি শক্তিশালী ও দায়িত্বশীল সংযোগ গড়ে তোলে।
  </p>
  <p>
    আমরা পুনর্মিলনী, নেটওয়ার্কিং, ক্যারিয়ার উন্নয়ন, মেন্টরশিপ এবং সমাজসেবা সম্পর্কিত বিভিন্ন কর্মকাণ্ড আয়োজন করে থাকি। আমাদের লক্ষ্য হলো সদস্যদের ব্যক্তিগত ও পেশাগত উন্নয়নে সহযোগিতা করা এবং বিশ্ববিদ্যালয়ের অগ্রগতিতে তাদের অংশগ্রহণ নিশ্চিত করা।
  </p>
  <p>
    <strong>ভিশন:</strong> সদস্য, ছাত্র-ছাত্রী ও বিশ্ববিদ্যালয়ের মধ্যে জীবনব্যাপী সম্পর্ক গঠন করে একটি গ্লোবালি সংযুক্ত সম্প্রদায় তৈরি করা।
  </p>
  <p>
    <strong>মিশন:</strong> যোগাযোগ, সহযোগিতা ও সেবার মাধ্যমে বিশ্ববিদ্যালয়-অ্যালামনাই সম্পর্ক শক্তিশালী করা; কর্মসংস্থান ও নেতৃত্ব উন্নয়নে সহায়তা প্রদানে উৎসাহিত করা।
  </p>
  <p>
    <a href="/register" style="color:var(--primary);font-weight:700;">রেজিস্ট্রেশন করুন</a> — আমাদের কার্যক্রমে যুক্ত হতে এবং আপডেট পেতে।
  </p>
</div>
`;
 
/* ── Main page ── */
export default function About() {
  const [content, setContent] = useState({
    title: "ভূমিকা",
    body: defaultBody,
    trustPoints: defaultTrustPoints,
    lifetimeMembers: "",
    committee: "",
  });
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

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
          trustPoints: data.about.trustPoints?.length ? data.about.trustPoints : defaultTrustPoints,
          stats: data.about.stats?.length ? data.about.stats : [],
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
    { key: "members",   label: "সদস্যগণ",            icon: Users, color: "#5a4ef6", bg: "#eef1ff", action: () => navigate('/members') },
    { key: "committee", label: "কার্যনির্বাহী পরিষদ", icon: Award, color: "#10b981", bg: "#edfcf3", action: () => navigate('/executive') },
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
          grid-template-columns: 1fr;
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

            {/* stats column removed as requested */}
          </div>

          {/* ── Three Expandable Cards ── */}
          <div className="about-cards-section">
            {CARDS.map(({ key, label, icon: Icon, color, bg, action }) => {
              const isOpen = open === key;
              const html = content[key];
              return (
                <div className="about-acc-card" key={key}>
                  <button className="about-acc-header" onClick={() => {
                    if (typeof action === 'function') return action();
                    return toggle(key);
                  }} aria-expanded={isOpen}>
                    <span className="about-acc-icon" style={{ background: bg, color }}>
                      <Icon />
                    </span>
                    <span className="about-acc-title">{label}</span>
                    <ChevronDown size={18} className={`about-acc-chevron${isOpen ? " open" : ""}`} />
                  </button>

                  <div className={`about-acc-body${isOpen ? " open" : ""}`}>
                    {isOpen && key === 'members' && <MembersList />}
                    {isOpen && key !== 'members' && (
                      html ? (
                        <div className="about-acc-content" dangerouslySetInnerHTML={{ __html: html }} />
                      ) : (
                        <div className="about-acc-empty">এখনো কোনো তথ্য যোগ করা হয়নি।</div>
                      )
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
