import React, { useEffect, useState, useMemo } from "react";
import {
  Book,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Hash,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PAGE_SIZE = 15;

export default function AdminDonations() {
  const { auth } = useAuth();
  const [donations, setDonations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);
  const [deleting, setDeleting]     = useState(null); // id being deleted

  useEffect(() => { fetchDonations(); }, []);

  async function fetchDonations() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/donations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch donations");
      setDonations(await res.json());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleStatusUpdate(id, status) {
    try {
      const res = await fetch(`${apiBase}/api/admin/donations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setDonations(prev => prev.map(d => d._id === id ? { ...d, status } : d));
      setSelected(prev => prev?._id === id ? { ...prev, status } : prev);
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this donation? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${apiBase}/api/admin/donations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDonations(prev => prev.filter(d => d._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) { setError(err.message); }
    finally { setDeleting(null); }
  }

  function exportCSV() {
    const rows = [
      ["Donor Name", "Email", "Mobile", "Amount (৳)", "Date", "TXN ID", "Category", "Status", "Message"],
      ...filtered.map(d => [
        d.user?.fullName || "",
        d.user?.email || "",
        d.user?.mobileNumber || "",
        Number(d.amount || 0).toFixed(2),
        fmtDate(d.donationDate),
        d.transactionId || "",
        d.category || "General",
        d.status,
        d.message || "",
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `donations-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalAmount   = donations.filter(d => d.status === "approved").reduce((s, d) => s + Number(d.amount || 0), 0);
  const approvedCount = donations.filter(d => d.status === "approved").length;
  const pendingCount  = donations.filter(d => d.status === "pending").length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return donations.filter(d => {
      const matchFilter = filter === "all" || d.status === filter;
      const matchSearch = !q ||
        d.user?.fullName?.toLowerCase().includes(q) ||
        d.user?.email?.toLowerCase().includes(q) ||
        d.transactionId?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [donations, filter, search]);

  // Reset to page 1 whenever filter/search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  const monthlyData = useMemo(() => {
    const map = {};
    donations.forEach(d => {
      const date = new Date(d.donationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { month: label, approved: 0, pending: 0, rejected: 0, key };
      if (d.status === "approved") map[key].approved += Number(d.amount || 0);
      if (d.status === "pending")  map[key].pending  += Number(d.amount || 0);
      if (d.status === "rejected") map[key].rejected += Number(d.amount || 0);
    });
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ month, approved, pending, rejected }) => ({ month, approved, pending, rejected }));
  }, [donations]);

  const rejectedCount = donations.filter(d => d.status === "rejected").length;

  const statusPie = useMemo(() => [
    { name: "Approved", value: approvedCount, fill: "#16a34a" },
    { name: "Pending",  value: pendingCount,  fill: "#ca8a04" },
    { name: "Rejected", value: rejectedCount, fill: "#dc2626" },
  ].filter(d => d.value > 0), [approvedCount, pendingCount, rejectedCount]);

  const categoryData = useMemo(() => {
    const map = {};
    donations.filter(d => d.status === "approved").forEach(d => {
      const cat = d.category || "General";
      map[cat] = (map[cat] || 0) + Number(d.amount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, total]) => ({ name, total }));
  }, [donations]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const statusColor = s =>
    s === "approved" ? { bg: "#f0fdf4", color: "#166534", dot: "#16a34a" } :
    s === "rejected" ? { bg: "#fef2f2", color: "#991b1b", dot: "#dc2626" } :
                       { bg: "#fefce8", color: "#854d0e", dot: "#ca8a04" };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .adm-don * { font-family: 'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing: border-box; }
        .don-tr { border-bottom: 1px solid #f8fafc; transition: background .15s; }
        .don-tr:hover { background: #f8fafc; }
        .act-btn { padding:5px 12px; border-radius:8px; border:1.5px solid; cursor:pointer;
          font-size:12px; font-weight:700; background:transparent; transition:all .15s; }
        .act-approve { color:#16a34a; border-color:#86efac; }
        .act-approve:hover { background:#16a34a; color:#fff; border-color:#16a34a; }
        .act-reject  { color:#dc2626; border-color:#fca5a5; }
        .act-reject:hover  { background:#dc2626; color:#fff; border-color:#dc2626; }
        .view-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 11px;
          border-radius:8px; border:1.5px solid #c7d2fe; color:#3730a3; background:transparent;
          font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
        .view-btn:hover { background:#eef2ff; border-color:#3730a3; }
        .del-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 10px;
          border-radius:8px; border:1.5px solid #fca5a5; color:#dc2626; background:transparent;
          font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
        .del-btn:hover { background:#dc2626; color:#fff; border-color:#dc2626; }
        .del-btn:disabled { opacity:.4; cursor:not-allowed; }
        .export-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
          border-radius:10px; border:1.5px solid #c7d2fe; color:#3730a3; background:#fff;
          font-size:12px; font-weight:700; cursor:pointer; transition:all .2s; }
        .export-btn:hover { background:#eef2ff; }
        .page-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid #e2e8f0;
          background:#fff; color:#475569; font-size:14px; display:flex; align-items:center;
          justify-content:center; cursor:pointer; transition:all .15s; }
        .page-btn:hover:not(:disabled) { border-color:#3730a3; color:#3730a3; }
        .page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .page-num { padding:0 6px; font-size:13px; font-weight:600; color:#3730a3;
          background:#eef2ff; border-radius:8px; height:32px; display:flex;
          align-items:center; border:1.5px solid #c7d2fe; white-space:nowrap; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45);
          backdrop-filter:blur(4px); z-index:999; display:flex;
          align-items:center; justify-content:center; padding:20px; }
        .modal { background:#fff; border-radius:20px; width:100%; max-width:640px;
          max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,0.2); }
        .modal-hero { background:linear-gradient(135deg,#1a1f6e,#3b4fd8);
          padding:28px 32px; border-radius:20px 20px 0 0; position:sticky; top:0; z-index:1; }
        .detail-row { display:flex; align-items:flex-start; gap:10px;
          padding:12px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
        .detail-row:last-child { border-bottom:none; }
        .detail-icon { color:#3b4fd8; font-size:15px; margin-top:2px; flex-shrink:0; }
        .detail-key { font-weight:700; color:#1e293b; min-width:130px; flex-shrink:0; }
        .detail-val { color:#475569; word-break:break-all; }
        .receipt-link { display:inline-flex; align-items:center; gap:6px;
          color:#3b4fd8; font-weight:700; text-decoration:none; font-size:13px; }
        .receipt-link:hover { text-decoration:underline; }
        .section-head { font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#94a3b8; padding:14px 0 6px; }
        .adm-don { display:flex; flex-direction:column; gap:20px; }
        .adm-hero { display:flex; align-items:center; justify-content:space-between;
          gap:16px; position:relative; overflow:hidden;
          background:linear-gradient(135deg,#3730a3 0%,#4f46e5 50%,#6366f1 100%);
          border-radius:16px; padding:36px 40px; }
        .adm-hero::before { content:''; position:absolute; top:-60px; right:-60px;
          width:240px; height:240px; background:rgba(255,255,255,.05); border-radius:50%; pointer-events:none; }
        .charts-grid { display:grid; grid-template-columns:1fr 200px 1fr; gap:16px; }
        @media(max-width:1100px){
          .charts-grid { grid-template-columns:1fr 1fr; }
          .charts-grid > div:nth-child(2) { grid-column:1 / -1; order:3; }
        }
        @media(max-width:900px){
          .adm-stats { grid-template-columns:repeat(3,1fr)!important; }
        }
        @media(max-width:768px){
          .adm-hero { padding:24px 20px; flex-direction:column; align-items:flex-start; }
          .adm-hero .export-hero-btn { align-self:flex-start; }
          .charts-grid { grid-template-columns:1fr; }
          .charts-grid > div:nth-child(2) { order:0; grid-column:auto; }
          .tbl-controls { flex-direction:column; align-items:flex-start!important; }
        }
        @media(max-width:640px){
          .adm-stats { grid-template-columns:repeat(2,1fr)!important; }
          .adm-tbl-wrap { font-size:13px; }
          S.page { padding:14px!important; }
        }
        @media(max-width:420px){
          .adm-stats { grid-template-columns:1fr!important; }
          .adm-don { gap:14px; }
        }
      `}</style>

      <div className="adm-don">

        {/* Hero */}
        <div className="adm-hero">
          <div style={{ zIndex:1, position:"relative" }}>
            <div style={S.heroBadge}><CreditCard style={{fontSize:12}}/> ADMIN PANEL</div>
            <h1 style={S.heroTitle}>Donation Review</h1>
            <p style={S.heroSub}>Approve, reject, or delete submitted donations from members.</p>
          </div>
          <button className="export-btn export-hero-btn" onClick={exportCSV}
            style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)",
              color:"#fff", zIndex:1, position:"relative", flexShrink:0 }}>
            <Download style={{fontSize:14}}/> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="adm-stats" style={S.statsRow}>
          {[
            { icon:<DollarSign/>, bg:"#EEF2FF", label:"APPROVED TOTAL",
              val:`৳${totalAmount.toLocaleString()}`, color:"#1e293b" },
            { icon:<CheckCircle/>, bg:"#DCFCE7", label:"APPROVED",
              val:approvedCount, color:"#16a34a" },
            { icon:<Clock/>, bg:"#FEF9C3", label:"PENDING",
              val:pendingCount, color:"#ca8a04" },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={{...S.statIcon, background:s.bg, color:s.color}}>{s.icon}</div>
              <div>
                <div style={S.statLabel}>{s.label}</div>
                <div style={{...S.statValue, color:s.color}}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {donations.length > 0 && (
          <div className="charts-grid">

            {/* Monthly bar chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>
                <TrendingUp style={{ color:"#4f46e5", fontSize:16 }}/>
                Monthly Donations
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={monthlyData} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8", fontWeight:600 }}
                    axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `৳${v}`} width={52}/>
                  <Tooltip
                    contentStyle={{ borderRadius:10, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,.1)",
                      fontSize:12, fontFamily:"inherit" }}
                    formatter={(val, name) => [`৳${Number(val).toFixed(2)}`, name]}/>
                  <Bar dataKey="approved" name="Approved" fill="#4f46e5" radius={[5,5,0,0]} maxBarSize={32}/>
                  <Bar dataKey="pending"  name="Pending"  fill="#fbbf24" radius={[5,5,0,0]} maxBarSize={32}/>
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[5,5,0,0]} maxBarSize={32}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div style={{ ...S.chartCard, alignItems:"center", justifyContent:"center" }}>
              <div style={S.chartTitle}>Status Split</div>
              <PieChart width={152} height={152}>
                <Pie data={statusPie} cx={76} cy={76} innerRadius={44} outerRadius={68}
                  dataKey="value" paddingAngle={3}>
                  {statusPie.map((e, i) => <Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:10, border:"none",
                  boxShadow:"0 4px 16px rgba(0,0,0,.1)", fontSize:12, fontFamily:"inherit" }}/>
              </PieChart>
              <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
                {statusPie.map(s => (
                  <div key={s.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:s.fill, flexShrink:0 }}/>
                    <span style={{ color:"#64748b", flex:1 }}>{s.name}</span>
                    <span style={{ fontWeight:700, color:"#1e293b" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category bar chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>
                <Tag style={{ color:"#4f46e5", fontSize:16 }}/>
                Top Categories (Approved ৳)
              </div>
              {categoryData.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#94a3b8", fontSize:13 }}>
                  No approved donations yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={categoryData} layout="vertical" barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                    <XAxis type="number" tick={{ fontSize:10, fill:"#94a3b8" }}
                      axisLine={false} tickLine={false} tickFormatter={v => `৳${v}`}/>
                    <YAxis type="category" dataKey="name" width={72}
                      tick={{ fontSize:11, fill:"#475569", fontWeight:600 }}
                      axisLine={false} tickLine={false}/>
                    <Tooltip
                      contentStyle={{ borderRadius:10, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,.1)",
                        fontSize:12, fontFamily:"inherit" }}
                      formatter={val => [`৳${Number(val).toFixed(2)}`, "Total"]}/>
                    <Bar dataKey="total" name="Total" fill="#10b981" radius={[0,5,5,0]} maxBarSize={24}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Table section */}
        <div style={S.tableSection}>
          <div style={S.tableHeader}>
            <div>
              <div style={S.tableTitle}>All Donations</div>
              <div style={S.tableCount}>
                {filtered.length} donation{filtered.length!==1?"s":""}
                {filtered.length !== donations.length && ` (filtered from ${donations.length})`}
              </div>
            </div>
            <div className="tbl-controls" style={S.tableControls}>
              {/* Filter tabs */}
              <div style={S.filterRow}>
                {["all","pending","approved","rejected"].map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{...S.filterBtn, ...(filter===f ? S.filterBtnActive : {})}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                    <span style={S.filterCount}>
                      {f==="all" ? donations.length : donations.filter(d=>d.status===f).length}
                    </span>
                  </button>
                ))}
              </div>
              {/* Search */}
              <div style={S.searchWrap}>
                <Search style={S.searchIcon}/>
                <input type="text" placeholder="Search name, email, TXN…"
                  value={search} onChange={e=>setSearch(e.target.value)}
                  style={S.searchInput}/>
                {search && (
                  <button onClick={()=>setSearch("")}
                    style={{position:"absolute",right:8,background:"none",border:"none",
                      color:"#94a3b8",cursor:"pointer",padding:0,fontSize:14}}>
                    <X/>
                  </button>
                )}
              </div>
              {/* CSV export (secondary, smaller) */}
              <button className="export-btn" onClick={exportCSV}>
                <Download style={{fontSize:13}}/> CSV
              </button>
            </div>
          </div>

          {error && (
            <div style={S.errorBanner}>
              {error}
              <button onClick={()=>setError(null)}
                style={{marginLeft:"auto",background:"none",border:"none",
                  color:"#dc2626",cursor:"pointer",padding:0}}>
                <X/>
              </button>
            </div>
          )}

          {loading ? (
            <div style={S.emptyState}>Loading donations…</div>
          ) : (
            <>
              <div className="adm-tbl-wrap" style={{overflowX:"auto"}}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.thead}>
                      <th style={{...S.th,width:"22%"}}>DONOR</th>
                      <th style={{...S.th,width:"11%"}}>AMOUNT</th>
                      <th style={{...S.th,width:"11%"}}>DATE</th>
                      <th style={{...S.th,width:"13%"}}>TXN ID</th>
                      <th style={{...S.th,width:"11%"}}>CATEGORY</th>
                      <th style={{...S.th,width:"9%"}}>STATUS</th>
                      <th style={{...S.th,width:"23%",textAlign:"right"}}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={7} style={S.emptyState}>No donations found</td></tr>
                    ) : paginated.map(d => {
                      const sc = statusColor(d.status);
                      return (
                        <tr key={d._id} className="don-tr" style={S.tr}>
                          <td style={S.td}>
                            <div style={S.donorName}>{d.user?.fullName||"Unknown"}</div>
                            <div style={S.donorEmail}>{d.user?.email}</div>
                          </td>
                          <td style={S.td}>
                            <span style={S.amount}>৳{Number(d.amount||0).toFixed(2)}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.dateText}>{fmtDate(d.donationDate)}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.txnId}>{d.transactionId||"—"}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.catPill}>{d.category||"General"}</span>
                          </td>
                          <td style={S.td}>
                            <span style={{...S.badge, background:sc.bg, color:sc.color}}>
                              <span style={{...S.badgeDot, background:sc.dot}}/>
                              {d.status}
                            </span>
                          </td>
                          <td style={{...S.td, textAlign:"right"}}>
                            <div style={{display:"flex",justifyContent:"flex-end",gap:5,flexWrap:"wrap"}}>
                              <button className="view-btn" onClick={()=>setSelected(d)}>
                                <Eye style={{fontSize:12}}/> View
                              </button>
                              {d.status!=="approved" && (
                                <button className="act-btn act-approve"
                                  onClick={()=>handleStatusUpdate(d._id,"approved")}>
                                  <Check size={12} />
                                </button>
                              )}
                              {d.status!=="rejected" && (
                                <button className="act-btn act-reject"
                                  onClick={()=>handleStatusUpdate(d._id,"rejected")}>
                                  <X size={12} />
                                </button>
                              )}
                              <button className="del-btn"
                                disabled={deleting===d._id}
                                onClick={()=>handleDelete(d._id)}>
                                <Trash2 style={{fontSize:12}}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={S.pagination}>
                  <span style={{fontSize:13,color:"#64748b"}}>
                    Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} total
                  </span>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button className="page-btn" disabled={page===1}
                      onClick={()=>setPage(p=>p-1)}>
                      <ChevronLeft/>
                    </button>
                    <span className="page-num">{page} / {totalPages}</span>
                    <button className="page-btn" disabled={page===totalPages}
                      onClick={()=>setPage(p=>p+1)}>
                      <ChevronRight/>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hero">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".1em",
                    textTransform:"uppercase",color:"rgba(255,255,255,.6)",marginBottom:6}}>
                    Donation Detail
                  </div>
                  <h2 style={{fontSize:22,fontWeight:800,color:"#fff",margin:0}}>
                    {selected.user?.fullName||"Unknown Donor"}
                  </h2>
                  <div style={{color:"rgba(255,255,255,.65)",fontSize:13,marginTop:4}}>
                    {selected.user?.email}
                  </div>
                </div>
                <button onClick={()=>setSelected(null)}
                  style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
                    color:"#fff",borderRadius:"50%",width:36,height:36,display:"flex",
                    alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>
                  <X/>
                </button>
              </div>
              {/* Status + quick actions */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:20,flexWrap:"wrap"}}>
                {(() => { const sc=statusColor(selected.status); return (
                  <span style={{...S.badge,background:"rgba(255,255,255,.15)",
                    color:"#fff",border:"1px solid rgba(255,255,255,.25)"}}>
                    <span style={{...S.badgeDot,background:sc.dot}}/>
                    {selected.status}
                  </span>
                );})()}
                {selected.status!=="approved" && (
                  <button className="act-btn act-approve"
                    style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}}
                    onClick={()=>handleStatusUpdate(selected._id,"approved")}>
                    <Check size={12} style={{ marginRight: 6 }} />
                    Approve
                  </button>
                )}
                {selected.status!=="rejected" && (
                  <button className="act-btn act-reject"
                    style={{color:"#fca5a5",borderColor:"rgba(252,165,165,.5)"}}
                    onClick={()=>handleStatusUpdate(selected._id,"rejected")}>
                    <X size={12} style={{ marginRight: 6 }} />
                    Reject
                  </button>
                )}
                <button className="del-btn"
                  style={{marginLeft:"auto",color:"#fca5a5",borderColor:"rgba(252,165,165,.4)"}}
                  disabled={deleting===selected._id}
                  onClick={()=>handleDelete(selected._id)}>
                  <Trash2 style={{fontSize:13}}/> Delete
                </button>
              </div>
            </div>

            <div style={{padding:"20px 32px 28px"}}>
              <div className="section-head">Donation Information</div>
              <DR icon={<DollarSign/>} label="Amount"        val={`৳${Number(selected.amount||0).toFixed(2)}`}/>
              <DR icon={<Calendar/>}  label="Date"           val={fmtDate(selected.donationDate)}/>
              <DR icon={<Hash/>}      label="Transaction ID" val={selected.transactionId||"—"}/>
              <DR icon={<Tag/>}       label="Category"       val={selected.category||"General"}/>
              {selected.message && <DR icon={<MessageSquare/>} label="Message" val={selected.message}/>}
              {selected.receipt && (
                <DR icon={<CreditCard/>} label="Receipt"
                  val={
                    <a href={selected.receipt.startsWith("http") ? selected.receipt : `${apiBase}/uploads/${selected.receipt}`}
                      target="_blank" rel="noopener noreferrer" className="receipt-link">
                      <Eye style={{fontSize:13}}/> View Receipt
                    </a>
                  }/>
              )}

              <div className="section-head" style={{marginTop:8}}>Donor Profile</div>
              <DR icon={<User/>}   label="Full Name"     val={selected.user?.fullName||"—"}/>
              <DR icon={<Mail/>}   label="Email"         val={selected.user?.email||"—"}/>
              <DR icon={<Phone/>}  label="Mobile"        val={selected.user?.mobileNumber||"—"}/>
              <DR icon={<MapPin/>} label="District"      val={selected.user?.district||"Chandpur"}/>
              <DR icon={<MapPin/>} label="Upazila"       val={selected.user?.upazila||"—"}/>
              <DR icon={<MapPin/>} label="Village"       val={selected.user?.villageName||"—"}/>
              <DR icon={<MapPin/>} label="Police Stn."   val={selected.user?.policeStation||"—"}/>
              <DR icon={<Book/>}   label="Education"     val={selected.user?.lastEducation||"—"}/>
              <DR icon={<User/>}   label="Date of Birth" val={selected.user?.dateOfBirth||"—"}/>
              <DR icon={<User/>}   label="Political"     val={selected.user?.politicalAffiliation||"—"}/>
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
      <span className="detail-icon">{icon}</span>
      <span className="detail-key">{label}</span>
      <span className="detail-val">{val}</span>
    </div>
  );
}

const S = {
  page: { minHeight:"100vh", background:"var(--bg)", padding:"clamp(14px,3vw,24px)",
    fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" },
  hero: {},
  heroBadge: { display:"inline-flex", alignItems:"center", gap:6, marginBottom:12,
    fontSize:11, fontWeight:700, color:"rgba(255,255,255,.85)", letterSpacing:".1em",
    padding:"5px 12px", background:"rgba(255,255,255,.12)",
    border:"1px solid rgba(255,255,255,.2)", borderRadius:999 },
  heroTitle: { fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 6px" },
  heroSub: { fontSize:14, color:"rgba(255,255,255,.7)", margin:0 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"clamp(10px,2vw,16px)" },
  statCard: { background:"#fff", borderRadius:14, padding:"20px 24px",
    display:"flex", alignItems:"center", gap:16, boxShadow:"0 1px 4px rgba(0,0,0,.06)" },
  statIcon: { width:48, height:48, borderRadius:12, display:"flex",
    alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20 },
  statLabel: { fontSize:11, fontWeight:700, color:"#94a3b8",
    letterSpacing:".08em", marginBottom:4, textTransform:"uppercase" },
  statValue: { fontSize:26, fontWeight:800, color:"#1e293b", lineHeight:1 },
  tableSection: { background:"#fff", borderRadius:14,
    boxShadow:"0 1px 4px rgba(0,0,0,.06)", overflow:"hidden" },
  tableHeader: { padding:"20px 24px", borderBottom:"1px solid var(--border)",
    display:"flex", alignItems:"flex-start", justifyContent:"space-between",
    flexWrap:"wrap", gap:12 },
  tableTitle: { fontSize:16, fontWeight:700, color:"#1e293b" },
  tableCount: { fontSize:13, color:"#94a3b8", marginTop:2 },
  tableControls: { display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  filterRow: { display:"flex", gap:4, background:"var(--surface-soft)",
    border:"1px solid var(--border)", borderRadius:10, padding:3 },
  filterBtn: { padding:"5px 12px", borderRadius:8, border:"none",
    background:"transparent", cursor:"pointer", fontSize:13, color:"#64748b",
    fontWeight:500, display:"flex", alignItems:"center", gap:5 },
  filterBtnActive: { background:"#fff", color:"var(--primary)",
    fontWeight:700, boxShadow:"0 1px 4px rgba(0,0,0,.1)" },
  filterCount: { fontSize:11, background:"var(--surface-soft)", borderRadius:99,
    padding:"1px 6px", color:"#64748b" },
  searchWrap: { position:"relative", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:10, fontSize:14, color:"#94a3b8", pointerEvents:"none" },
  searchInput: { paddingLeft:32, paddingRight:28, paddingTop:8, paddingBottom:8,
    border:"1px solid var(--border)", borderRadius:10, fontSize:13, color:"#1e293b",
    outline:"none", width:"min(220px, 100%)", background:"#fbfaf6", fontFamily:"inherit" },
  errorBanner: { margin:"0 24px 12px", padding:"10px 14px",
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:8, color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", gap:8 },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"var(--surface-soft)" },
  th: { padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700,
    color:"#94a3b8", letterSpacing:".07em", borderBottom:"1px solid #f1f5f9" },
  tr: { borderBottom:"1px solid var(--surface-soft)" },
  td: { padding:"13px 16px", fontSize:14, color:"#334155", verticalAlign:"middle" },
  donorName: { fontWeight:700, color:"#1e293b", fontSize:14 },
  donorEmail: { fontSize:12, color:"#94a3b8", marginTop:2 },
  amount: { fontWeight:700, color:"#1e293b" },
  dateText: { fontSize:13, color:"#64748b" },
  txnId: { fontFamily:"monospace", fontSize:12, background:"var(--surface-soft)",
    padding:"3px 8px", borderRadius:6, color:"#475569" },
  catPill: { fontSize:11, background:"#eef2ff", color:"#3730a3",
    padding:"3px 8px", borderRadius:99, fontWeight:600 },
  badge: { display:"inline-flex", alignItems:"center", gap:5,
    fontSize:11, fontWeight:600, padding:"3px 10px",
    borderRadius:99, textTransform:"capitalize" },
  badgeDot: { width:5, height:5, borderRadius:"50%", display:"inline-block" },
  emptyState: { padding:48, textAlign:"center", color:"#94a3b8", fontSize:14 },
  pagination: { padding:"14px 24px", borderTop:"1px solid #f1f5f9",
    display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  chartCard: { background:"#fff", borderRadius:14, padding:"20px 20px 12px",
    boxShadow:"0 1px 4px rgba(0,0,0,.06)", display:"flex", flexDirection:"column", gap:12 },
  chartTitle: { display:"flex", alignItems:"center", gap:8, fontWeight:700,
    fontSize:14, color:"#1e293b" },
};
