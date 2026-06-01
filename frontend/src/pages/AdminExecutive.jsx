import React, { useEffect, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminExecutive() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ year: '', title: '', members: [] });

  const css = `
    .admin-exec-wrap { margin-top: 8px; }
    .admin-exec-wrap .years-col { flex: 1; }
    .admin-exec-wrap .editor-col { flex: 2; }
    .year-item { display:flex; justify-content:space-between; align-items:center; padding:12px; border-radius:10px; border:1px solid #eef2f6; background: #fff; }
    .year-item + .year-item { margin-top:10px; }
    .year-item strong { font-size: 15px; display:block; }
    .year-item .muted { font-size:13px; color:#6b7280 }

    .editor-card { background: #fff; border-radius:12px; padding:14px; border:1px solid #eef2f6; box-shadow:0 6px 18px rgba(15,23,42,0.04); }
    .editor-col input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e6edf3; margin-bottom:8px; background:#fbfdff }
    .member-row input { padding:8px 10px; border-radius:8px; border:1px solid #e6edf3; }

    .btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:700; }
    .btn-primary { background:linear-gradient(135deg,#1a56d6,#3b82f6); color:#fff }
    .btn-ghost { background:transparent; border:1px solid #e6edf3; color:#0f172a }
    .btn-danger { background:#fee2e2; color:#b91c1c }
    .btn-small { padding:6px 10px; font-weight:600; border-radius:8px }
    .label-row { display:flex; gap:8px; font-weight:800; color:#0f172a; margin-bottom:8px }
    .member-grid { display:flex; gap:8px; align-items:center }
    @media(max-width:900px){ .member-grid { flex-direction:column; align-items:stretch } }
  `;

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    setLoading(true);
    try {
      if (!auth?.token) { navigate('/login'); return; }
      const res = await fetch(`${apiBase}/api/admin/executive`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const data = await res.json();
      setList(data.list || []);
    } catch (err) { setError(err.message || 'Failed'); }
    setLoading(false);
  }

  function startCreate() { setEditing(null); setForm({ year: '', title: '', members: [] }); }

  function startEdit(item) {
    setEditing(item._id);
    setForm({ year: item.year || '', title: item.title || '', members: (item.members || []).map(m=>({
      name: m.name||'', position: m.position||'', email: m.email||'', phone: m.phone||'', department: m.department||''
    })) });
  }

  async function save() {
    try {
      if (!auth?.token) { navigate('/login'); return; }
      const members = Array.isArray(form.members) ? form.members : [];
      const payload = { year: form.year, title: form.title, members };
      const opts = {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload),
      };
      const url = editing ? `${apiBase}/api/admin/executive/${editing}` : `${apiBase}/api/admin/executive`;
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      await fetchList();
      startCreate();
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this year?')) return;
    try {
      if (!auth?.token) { navigate('/login'); return; }
      const res = await fetch(`${apiBase}/api/admin/executive/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      await fetchList();
    } catch (err) { setError(err.message || 'Failed to delete'); }
  }

  return (
    <section className="page-section page-band">
      <div className="container">
        <SectionTitle eyebrow="Admin" title="Executive Management" align="left" />
        <style>{css}</style>

        <div style={{ display: 'flex', gap: 20, marginTop: 12 }} className="admin-exec-wrap">
          <div className="years-col">
            <h3>Years</h3>
            {loading ? <div>Loading…</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.map(l => (
                  <div key={l._id} className="year-item">
                    <div>
                      <strong>{l.year}</strong>
                      <div className="muted">{l.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => startEdit(l)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(l._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="editor-col">
            <div className="editor-card">
              <h3 style={{ marginTop: 0 }}>{editing ? 'Edit' : 'Create'} Year</h3>
              {error && <div style={{ color: 'red' }}>{error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="field" placeholder="Year (e.g., 2023-2024)" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                <input className="field" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <div style={{ border: '1px solid #eef2f6', padding: 12, borderRadius: 8 }}>
                  <div className="label-row">
                    <div style={{ flex: 2 }}>Name</div>
                    <div style={{ flex: 2 }}>Position</div>
                    <div style={{ flex: 2 }}>Email</div>
                    <div style={{ flex: 1 }}>Phone</div>
                    <div style={{ flex: 2 }}>Department</div>
                    <div style={{ width: 90 }}></div>
                  </div>
                  {(form.members || []).map((m, idx) => (
                    <div key={idx} className="member-row member-grid" style={{ marginBottom: 8 }}>
                      <input style={{ flex: 2 }} placeholder="Name" value={m.name} onChange={e => {
                        const copy = [...form.members]; copy[idx] = {...copy[idx], name: e.target.value}; setForm({...form, members: copy});
                      }} />
                      <input style={{ flex: 2 }} placeholder="Position" value={m.position} onChange={e => {
                        const copy = [...form.members]; copy[idx] = {...copy[idx], position: e.target.value}; setForm({...form, members: copy});
                      }} />
                      <input style={{ flex: 2 }} placeholder="Email" value={m.email} onChange={e => {
                        const copy = [...form.members]; copy[idx] = {...copy[idx], email: e.target.value}; setForm({...form, members: copy});
                      }} />
                      <input style={{ flex: 1 }} placeholder="Phone" value={m.phone} onChange={e => {
                        const copy = [...form.members]; copy[idx] = {...copy[idx], phone: e.target.value}; setForm({...form, members: copy});
                      }} />
                      <input style={{ flex: 2 }} placeholder="Department" value={m.department} onChange={e => {
                        const copy = [...form.members]; copy[idx] = {...copy[idx], department: e.target.value}; setForm({...form, members: copy});
                      }} />
                      <div style={{ width: 90, display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-small" type="button" onClick={() => {
                          const copy = [...(form.members||[])]; copy.splice(idx, 1); setForm({...form, members: copy});
                        }}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-primary btn-small" type="button" onClick={() => setForm({...form, members: [ ...(form.members||[]), { name:'', position:'', email:'', phone:'', department:'' } ] })}>Add Member</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
                  <button className="btn btn-ghost" onClick={startCreate}>Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
