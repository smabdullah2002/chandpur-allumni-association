import React, { useState, useEffect } from "react";
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Gallery() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lightbox, setLightbox] = useState(null); // index

  useEffect(() => {
    fetch(`${apiBase}/api/gallery`)
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function prev() { setLightbox(i => (i - 1 + items.length) % items.length); }
  function next() { setLightbox(i => (i + 1) % items.length); }

  useEffect(() => {
    function onKey(e) {
      if (lightbox === null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, items.length]);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f8", padding: "40px 20px",
      fontFamily: "'Hind Siliguri','Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        .pub-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 18px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .pub-gallery-card {
          border-radius: 14px; overflow: hidden; background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,.07); cursor: pointer;
          transition: transform .2s, box-shadow .2s;
        }
        .pub-gallery-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,.13); }
        .pub-gallery-img { width: 100%; height: 190px; object-fit: cover; display: block; }
        .lb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.88);
          display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .lb-nav { background: rgba(255,255,255,.12); border: none; color: #fff; border-radius: 50%;
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 20px; flex-shrink: 0; transition: background .2s; }
        .lb-nav:hover { background: rgba(255,255,255,.22); }
        @media(max-width:360px){ .pub-gallery-grid{ grid-template-columns:1fr; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1f6e", margin: "0 0 6px" }}>
          ফটো গ্যালারি
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
          সংগঠনের কার্যক্রমের ছবি
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে…</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: "#94a3b8" }}>
          <FiImage style={{ fontSize: 40, marginBottom: 10, opacity: .4 }} />
          <p>এখনো কোনো ছবি যোগ করা হয়নি।</p>
        </div>
      ) : (
        <div className="pub-gallery-grid">
          {items.map((item, idx) => (
            <div className="pub-gallery-card" key={item._id} onClick={() => setLightbox(idx)}>
              <img src={item.imageUrl} alt={item.title} className="pub-gallery-img" />
              <div style={{ padding: "10px 14px 12px" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.title}</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>
                  {new Date(item.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lb-overlay" onClick={() => setLightbox(null)}>
          <button className="lb-nav" onClick={e => { e.stopPropagation(); prev(); }}>
            <FiChevronLeft />
          </button>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            padding: "0 12px", maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <img src={items[lightbox].imageUrl} alt={items[lightbox].title}
              style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 12, objectFit: "contain" }} />
            <p style={{ color: "#fff", marginTop: 14, fontSize: 15, fontWeight: 600, textAlign: "center" }}>
              {items[lightbox].title}
            </p>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, margin: 0 }}>
              {lightbox + 1} / {items.length}
            </p>
          </div>
          <button className="lb-nav" onClick={e => { e.stopPropagation(); next(); }}>
            <FiChevronRight />
          </button>
          <button onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.15)",
              border: "none", color: "#fff", borderRadius: 8, width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}
