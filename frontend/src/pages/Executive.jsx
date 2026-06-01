import React, { useEffect, useState } from "react";
import SectionTitle from "../components/SectionTitle";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Executive() {
  const [years, setYears] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchYears(); }, []);

  async function fetchYears() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/executive`);
      const d = await res.json();
      setYears(d.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function openYear(idOrYear) {
    if (openId === idOrYear) { setOpenId(null); setDetail(null); return; }
    setOpenId(idOrYear);
    try {
      const res = await fetch(`${apiBase}/api/executive/${idOrYear}`);
      const d = await res.json();
      setDetail(d.executive || null);
    } catch (err) { console.error(err); setDetail(null); }
  }

  return (
    <section className="page-section page-band">
      <div className="container">
        <SectionTitle eyebrow="EC" title="Executive Committees" align="left" />

        <div style={{ marginTop: 12 }}>
          {loading ? <div>Loading…</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {years.map(y => (
                <div key={y._id} style={{ background: '#064ea6', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                  <button
                    onClick={() => openYear(y._id || y.year)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', color: 'inherit', fontWeight: 700
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{y.year} — {y.title || ''}</span>
                    <span style={{ opacity: 0.95 }}>{openId === (y._id || y.year) ? '−' : '+'}</span>
                  </button>

                  {openId === (y._id || y.year) && detail && detail.members && (
                    <div style={{ padding: 16, background: '#fff', color: '#111' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Sl No.</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Name</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Position</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>e.mail</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cell No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.members.map((m, i) => (
                            <tr key={i}>
                              <td style={{ border: '1px solid #eee', padding: 12, textAlign: 'center', width: 80 }}>{String(i+1).padStart(2,'0')}</td>
                              <td style={{ border: '1px solid #eee', padding: 12 }}>{m.name}{m.department ? <div style={{ color: '#666', fontSize: 13 }}>{m.department}</div> : null}</td>
                              <td style={{ border: '1px solid #eee', padding: 12 }}>{m.position}</td>
                              <td style={{ border: '1px solid #eee', padding: 12 }}>{m.email}</td>
                              <td style={{ border: '1px solid #eee', padding: 12 }}>{m.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
