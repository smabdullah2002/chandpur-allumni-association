import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Info,
  Search,
  Star,
  Zap,
} from "lucide-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const categoryMeta = {
  general:   { label: "General",   color: "#3b4fd8", bg: "#eef1ff", border: "#c7d2fe", icon: <Info /> },
  donation:  { label: "Donation",  color: "#10b981", bg: "#edfcf3", border: "#6ee7b7", icon: <Zap /> },
  event:     { label: "Event",     color: "#f59e0b", bg: "#fff8ec", border: "#fcd34d", icon: <Star /> },
  emergency: { label: "Emergency", color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", icon: <Bell /> },
};

async function downloadPdf(e, pdfUrl, noticeTitle) {
  e.preventDefault();
  e.stopPropagation();
  const filename = `${noticeTitle.replace(/[^a-zA-Z0-9ঀ-৿ _-]/g, "").trim()}.pdf`;
  try {
    const res  = await fetch(pdfUrl);
    const blob = await res.blob();
    const url  = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // CORS blocked — fall back to opening in a new tab
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }
}

export default function Notice() {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchNotices(); }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const res  = await fetch(`${apiBaseUrl}/api/notices`);
      const ct   = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : null;
      if (!res.ok) throw new Error(data?.error || "Failed to load notices");
      setNotices(Array.isArray(data?.notices) ? data.notices : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => notices.filter(n => {
    const matchCat    = filter === "all" || n.category === filter;
    const matchSearch = !search ||
      `${n.title} ${n.content} ${n.category}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [notices, filter, search]);

  const counts = useMemo(() => {
    const c = { all: notices.length };
    Object.keys(categoryMeta).forEach(k => {
      c[k] = notices.filter(n => n.category === k).length;
    });
    return c;
  }, [notices]);

  const fmtDate = d => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh",
      background: "linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)",
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .nr * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }

        .nr-hero {
          background: linear-gradient(135deg,#1a1f6e 0%,#2d3282 40%,#3b4fd8 100%);
          border-radius: 24px; padding: 40px 48px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(45,50,130,.35);
        }
        .nr-hero::before { content:''; position:absolute; top:-60px; right:-60px;
          width:240px; height:240px; background:rgba(255,255,255,.06); border-radius:50%; }
        .nr-hero::after  { content:''; position:absolute; bottom:-80px; right:120px;
          width:180px; height:180px; background:rgba(255,255,255,.04); border-radius:50%; }

        .nr-search { position:relative; z-index:1; margin-top:22px; max-width:420px; }
        .nr-search input {
          width:100%; padding:12px 16px 12px 44px; border-radius:12px; border:none;
          background:rgba(255,255,255,.15); color:#fff; font-size:14px;
          font-family:'Plus Jakarta Sans',sans-serif; outline:none;
          backdrop-filter:blur(8px); transition:background .2s; box-sizing:border-box;
        }
        .nr-search input::placeholder { color:rgba(255,255,255,.55); }
        .nr-search input:focus { background:rgba(255,255,255,.22); }
        .nr-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%);
          color:rgba(255,255,255,.6); font-size:16px; pointer-events:none; }

        .filter-bar {
          display:flex; gap:6px; flex-wrap:wrap;
          background:#fff; border-radius:14px; padding:8px;
          box-shadow:0 1px 6px rgba(0,0,0,.06); border:1px solid #f1f5f9;
        }
        .filter-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:10px; border:none; cursor:pointer;
          font-size:12px; font-weight:700; background:transparent; color:#64748b;
          transition:all .18s;
        }
        .filter-btn:hover { background:#f8fafc; }
        .filter-btn.active { color:#fff; }
        .filter-count { font-size:11px; padding:1px 6px; border-radius:99px;
          background:rgba(0,0,0,.1); }

        .notice-card {
          background:#fff; border-radius:18px; border:1.5px solid #f1f5f9;
          box-shadow:0 2px 12px rgba(0,0,0,.05); overflow:hidden;
          transition:all .25s ease; cursor:pointer;
        }
        .notice-card:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(45,50,130,.1); border-color:#c7d2fe; }
        .notice-card.is-open { border-color:#3b4fd8; box-shadow:0 6px 28px rgba(45,50,130,.14); }

        .card-head {
          display:flex; align-items:center; gap:16px; padding:20px 24px;
          user-select:none;
        }
        .cat-icon { width:46px; height:46px; border-radius:13px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:18px; }

        .card-meta { display:flex; align-items:center; gap:8px; margin-bottom:5px; flex-wrap:wrap; }
        .cat-pill { font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
          padding:3px 10px; border-radius:20px; border:1px solid; }
        .date-chip { display:flex; align-items:center; gap:4px; font-size:12px; color:#94a3b8; }

        .card-title { font-size:15px; font-weight:700; color:#0f172a; margin:0;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .chevron-icon { color:#94a3b8; font-size:18px; flex-shrink:0; transition:transform .25s; }
        .chevron-icon.open { transform:rotate(180deg); color:#3b4fd8; }

        .card-body-wrap {
          overflow:hidden;
          max-height:0; transition:max-height .35s ease;
        }
        .card-body-wrap.open { max-height:2000px; }

        .card-body-inner {
          border-top:1px solid #f1f5f9;
          padding:20px 24px 24px;
        }
        .content-text { font-size:14px; color:#334155; line-height:1.8; white-space:pre-wrap; word-break:break-word; }

        .pdf-link {
          display:inline-flex; align-items:center; gap:8px; margin-top:16px;
          padding:10px 18px; border-radius:10px; cursor:pointer;
          background:#eef2ff; border:1.5px solid #c7d2fe; color:#3b4fd8;
          font-size:13px; font-weight:700; text-decoration:none;
          font-family:'Plus Jakarta Sans',sans-serif;
          transition:all .18s;
        }
        .pdf-link:hover:not(:disabled) { background:#3b4fd8; color:#fff; border-color:#3b4fd8; }
        .pdf-link:disabled { opacity:.6; cursor:wait; }

        .empty-state { text-align:center; padding:72px 20px; background:#fff;
          border-radius:20px; box-shadow:0 2px 12px rgba(0,0,0,.05); }
        .empty-icon { width:68px; height:68px; background:#eef1ff; border-radius:50%;
          display:flex; align-items:center; justify-content:center; font-size:26px;
          color:#3b4fd8; margin:0 auto 14px; }

        @media(max-width:640px){
          .nr-hero { padding:28px 20px; }
          .card-head { padding:16px 18px; gap:12px; }
          .card-body-inner { padding:16px 18px 20px; }
          .cat-icon { width:38px; height:38px; border-radius:10px; font-size:15px; }
          .card-title { font-size:14px; }
          .filter-bar { gap:4px; padding:6px; }
          .filter-btn { padding:6px 10px; font-size:11px; }
        }
      `}</style>

      <div className="nr" style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px",
        display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero */}
        <div className="nr-hero">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Bell style={{ color: "#a5b4fc", fontSize: 18 }} />
              <span style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600,
                letterSpacing: ".08em", textTransform: "uppercase" }}>
                Community Board
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
              নোটিশ বোর্ড
            </h1>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, margin: 0 }}>
              সর্বশেষ বিজ্ঞপ্তি এবং ইভেন্ট সম্পর্কে আপ-টু-ডেট থাকুন।
            </p>
            <div className="nr-search">
              <Search className="nr-search-icon" />
              <input type="text" placeholder="নোটিশ খুঁজুন…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          {[
            { key: "all",       label: "সব",        color: "#1e293b", activeBg: "#1e293b" },
            { key: "general",   label: "সাধারণ",    color: "#3b4fd8", activeBg: "#3b4fd8" },
            { key: "donation",  label: "ডোনেশন",   color: "#10b981", activeBg: "#10b981" },
            { key: "event",     label: "ইভেন্ট",    color: "#f59e0b", activeBg: "#f59e0b" },
            { key: "emergency", label: "জরুরি",     color: "#ef4444", activeBg: "#ef4444" },
          ].map(f => (
            <button key={f.key} className={`filter-btn${filter === f.key ? " active" : ""}`}
              style={filter === f.key ? { background: f.activeBg } : {}}
              onClick={() => setFilter(f.key)}>
              {f.label}
              {counts[f.key] > 0 && (
                <span className="filter-count"
                  style={{ background: filter === f.key ? "rgba(255,255,255,.25)" : "#f1f5f9",
                    color: filter === f.key ? "#fff" : "#64748b" }}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", alignSelf: "center",
            display: "flex", alignItems: "center", gap: 4 }}>
            <Filter style={{ fontSize: 12 }} />
            {filtered.length} টি নোটিশ
          </span>
        </div>

        {/* List */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell /></div>
            <p style={{ fontWeight: 700, color: "#334155", fontSize: 15, margin: "0 0 5px" }}>লোড হচ্ছে…</p>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>একটু অপেক্ষা করুন।</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell /></div>
            <p style={{ fontWeight: 700, color: "#334155", fontSize: 15, margin: "0 0 5px" }}>লোড করতে সমস্যা হয়েছে</p>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell /></div>
            <p style={{ fontWeight: 700, color: "#334155", fontSize: 15, margin: "0 0 5px" }}>কোনো নোটিশ পাওয়া যায়নি</p>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
              {search ? "অনুসন্ধান পরিবর্তন করুন।" : "এখনো কোনো নোটিশ প্রকাশিত হয়নি।"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(notice => {
              const meta   = categoryMeta[notice.category] || categoryMeta.general;
              const isOpen = activeId === notice._id;
              return (
                <div key={notice._id}
                  className={`notice-card${isOpen ? " is-open" : ""}`}
                  onClick={() => setActiveId(isOpen ? null : notice._id)}>

                  <div className="card-head">
                    <div className="cat-icon" style={{ background: meta.bg, color: meta.color }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-meta">
                        <span className="cat-pill"
                          style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
                          {meta.label}
                        </span>
                        <span className="date-chip">
                          <Calendar style={{ fontSize: 11 }} />
                          {fmtDate(notice.createdAt)}
                        </span>
                        {notice.pdf && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3,
                            fontSize: 11, fontWeight: 700, color: "#3b4fd8",
                            background: "#eef2ff", padding: "2px 7px", borderRadius: 6 }}>
                            <FileText style={{ fontSize: 10 }} /> PDF
                          </span>
                        )}
                      </div>
                      <h2 className="card-title">{notice.title}</h2>
                    </div>
                    <ChevronDown className={`chevron-icon${isOpen ? " open" : ""}`} />
                  </div>

                  <div className={`card-body-wrap${isOpen ? " open" : ""}`}>
                    <div className="card-body-inner" onClick={e => e.stopPropagation()}>
                      <p className="content-text">{notice.content}</p>
                      {notice.pdf && (
                        <button
                          className="pdf-link"
                          disabled={downloading === notice._id}
                          onClick={async e => {
                            setDownloading(notice._id);
                            await downloadPdf(e, notice.pdf, notice.title);
                            setDownloading(null);
                          }}
                        >
                          <Download style={{ fontSize: 15 }} />
                          {downloading === notice._id
                            ? "ডাউনলোড হচ্ছে…"
                            : "সংযুক্তি ডাউনলোড করুন (PDF)"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
