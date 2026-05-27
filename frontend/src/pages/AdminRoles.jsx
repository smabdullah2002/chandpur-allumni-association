import React, { useEffect, useState } from "react";
import { Shield, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminRoles() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
      setRoleDrafts(
        data.reduce((acc, u) => {
          acc[u._id] = u.role || "user";
          return acc;
        }, {}),
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRole(userId) {
    const role = roleDrafts[userId];
    setSavingId(userId);
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : null;
        throw new Error(data?.error || "Failed to update role");
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update role");
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ar-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .ar-hero {
          background: linear-gradient(135deg,#0f1340 0%,#2d3282 45%,#3b4fd8 100%);
          border-radius: 22px; padding: 34px 38px; color:#fff;
          box-shadow:0 20px 60px rgba(15,19,64,.35); position:relative; overflow:hidden;
        }
        .ar-hero::after { content:''; position:absolute; top:-60px; right:-60px;
          width:200px; height:200px; background:rgba(255,255,255,.08); border-radius:50%; }
        .ar-card { background:#fff; border-radius:18px; border:1.5px solid #f1f5f9;
          box-shadow:0 2px 16px rgba(0,0,0,.05); overflow:hidden; }
        .ar-header { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 22px; border-bottom:1px solid #f1f5f9; }
        .ar-search { padding:8px 12px; border-radius:10px; border:1.5px solid #e2e8f0;
          font-size:13px; min-width:220px; }
        table { width:100%; border-collapse:collapse; }
        th { text-align:left; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:#94a3b8; padding:12px 18px; background:#f8fafc; }
        td { padding:14px 18px; border-top:1px solid #f8fafc; }
        .role-select { padding:8px 10px; border-radius:9px; border:1.5px solid #e2e8f0; font-size:13px; }
        .save-btn { padding:7px 14px; border-radius:8px; border:none;
          background:linear-gradient(135deg,#1a1f6e,#3b4fd8); color:#fff; font-weight:700;
          cursor:pointer; font-size:12px; }
        .save-btn:disabled { opacity:.6; cursor:not-allowed; }
        .badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:99px;
          font-size:11px; font-weight:700; background:#eef2ff; color:#3b4fd8; }
        .error { background:#fef2f2; border:1.5px solid #fca5a5; color:#dc2626;
          border-radius:12px; padding:12px 16px; margin:16px 0; font-size:13px; }
      `}</style>

      <div className="ar-root" style={{ maxWidth: 980, margin: "0 auto", padding: "34px 20px" }}>
        <div className="ar-hero">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Shield style={{ fontSize: 16, color: "#a5b4fc" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#a5b4fc" }}>
              Admin Panel
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Role Management</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.65)", fontSize: 13 }}>
            Assign super-admin or user roles for members.
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="ar-card" style={{ marginTop: 20 }}>
          <div className="ar-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users style={{ fontSize: 16, color: "#3b4fd8" }} />
              <strong style={{ fontSize: 14, color: "#1e293b" }}>Users</strong>
            </div>
            <input
              className="ar-search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: 22, color: "#94a3b8" }}>Loading users...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isSelf = auth?.user?._id === u._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{u.fullName}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.email}</div>
                        </td>
                        <td>
                          <span className="badge">{u.status || "pending"}</span>
                        </td>
                        <td>
                          <select
                            className="role-select"
                            value={roleDrafts[u._id] || "user"}
                            onChange={(e) =>
                              setRoleDrafts((prev) => ({ ...prev, [u._id]: e.target.value }))
                            }
                            disabled={isSelf}
                          >
                            <option value="user">User</option>
                            <option value="super-admin">Super Admin</option>
                          </select>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="save-btn"
                            onClick={() => handleSaveRole(u._id)}
                            disabled={
                              isSelf ||
                              savingId === u._id ||
                              roleDrafts[u._id] === u.role
                            }
                          >
                            {savingId === u._id ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 22, color: "#94a3b8" }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
