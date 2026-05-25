import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle, FiClock, FiCreditCard, FiPlus,
  FiHeart, FiTrendingUp, FiEye, FiX,
  FiHash, FiTag, FiCalendar, FiMessageSquare, FiFileText,
} from "react-icons/fi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Donations = () => {
  const { auth } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null); // view modal

  useEffect(() => { fetchDonations(); }, []);

  async function fetchDonations() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/donations/mine`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to load donations");
      setDonations(await res.json());
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  // Only approved donations count toward total
  const stats = useMemo(() => {
    return donations.reduce(
      (acc, d) => {
        if (d.status === "approved") {
          acc.total += Number(d.amount || 0);
          acc.approved += 1;
        }
        if (d.status === "pending") acc.pending += 1;
        if (d.status === "rejected") acc.rejected += 1;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    );
  }, [donations]);

  const monthlyData = useMemo(() => {
    const map = {};
    donations.forEach(d => {
      const date = new Date(d.donationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { month: label, approved: 0, pending: 0, key };
      if (d.status === "approved") map[key].approved += Number(d.amount || 0);
      if (d.status === "pending")  map[key].pending  += Number(d.amount || 0);
    });
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ month, approved, pending }) => ({ month, approved, pending }));
  }, [donations]);

  const statusPie = useMemo(() => [
    { name: "Approved", value: stats.approved,  fill: "#16a34a" },
    { name: "Pending",  value: stats.pending,   fill: "#ca8a04" },
    { name: "Rejected", value: stats.rejected,  fill: "#dc2626" },
  ].filter(d => d.value > 0), [stats]);

  const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const statusStyle = s =>
    s === "approved" ? { bg:"#f0fdf4", color:"#166534", dot:"#16a34a" } :
    s === "rejected" ? { bg:"#fef2f2", color:"#991b1b", dot:"#dc2626" } :
                       { bg:"#fefce8", color:"#854d0e", dot:"#ca8a04" };

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)",
      fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .don-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; }
        .hero-card { background:linear-gradient(135deg,#1a1f6e 0%,#2d3282 40%,#3b4fd8 100%);
          border-radius:24px; padding:40px 48px; position:relative; overflow:hidden;
          box-shadow:0 20px 60px rgba(45,50,130,0.35); }
        .hero-card::before { content:''; position:absolute; top:-60px; right:-60px;
          width:240px; height:240px; background:rgba(255,255,255,0.06); border-radius:50%; }
        .hero-card::after { content:''; position:absolute; bottom:-80px; right:120px;
          width:180px; height:180px; background:rgba(255,255,255,0.04); border-radius:50%; }
        .add-btn { background:#fff; color:#2d3282; border:none; padding:12px 24px;
          border-radius:12px; font-weight:700; font-size:14px; display:inline-flex;
          align-items:center; gap:8px; cursor:pointer; text-decoration:none;
          transition:all .2s; box-shadow:0 4px 16px rgba(0,0,0,.15);
          white-space:nowrap; z-index:1; position:relative; }
        .add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2); }
        .stat-card { background:#fff; border-radius:20px; padding:28px 32px;
          display:flex; align-items:center; gap:20px;
          box-shadow:0 2px 20px rgba(0,0,0,.06); border:1px solid rgba(255,255,255,.8);
          transition:all .25s; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.12); }
        .stat-card.highlight { background:linear-gradient(135deg,#2d3282 0%,#3b4fd8 100%);
          border:none; box-shadow:0 8px 32px rgba(45,50,130,.35); }
        .icon-wrap { width:56px; height:56px; border-radius:16px; display:flex;
          align-items:center; justify-content:center; flex-shrink:0; font-size:22px; }
        .icon-blue { background:#eef1ff; color:#3b4fd8; }
        .icon-amber { background:#fff8ec; color:#f59e0b; }
        .icon-green { background:#edfcf3; color:#10b981; }
        .icon-white { background:rgba(255,255,255,.15); color:#fff; }
        .stat-label { font-size:11px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#94a3b8; margin-bottom:4px; }
        .stat-label.on-dark { color:rgba(255,255,255,.7); }
        .stat-value { font-size:30px; font-weight:800; color:#0f172a; line-height:1; }
        .stat-value.on-dark { color:#fff; }
        .history-card { background:#fff; border-radius:20px;
          box-shadow:0 2px 20px rgba(0,0,0,.06); border:1px solid rgba(255,255,255,.8); overflow:hidden; }
        .history-header { padding:28px 32px 24px; border-bottom:1px solid #f1f5f9;
          display:flex; align-items:center; justify-content:space-between; }
        .table-head th { padding:12px 20px; font-size:11px; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; color:#94a3b8; background:#f8fafc; text-align:left; }
        .table-head th:first-child { border-radius:12px 0 0 12px; }
        .table-head th:last-child { border-radius:0 12px 12px 0; }
        .don-tr:hover td { background:#f8fafc; }
        .empty-state { padding:80px 20px; text-align:center; }
        .empty-icon { width:80px; height:80px; background:#f0f4ff; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 20px; font-size:32px; color:#3b4fd8; }
        .grid-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .view-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 14px;
          border-radius:8px; border:1.5px solid #c7d2fe; color:#3730a3;
          background:transparent; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
        .view-btn:hover { background:#eef2ff; }
        /* Modal */
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,.45);
          backdrop-filter:blur(4px); z-index:999;
          display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto; }
        .modal { background:#fff; border-radius:20px; width:100%; max-width:520px;
          box-shadow:0 24px 64px rgba(0,0,0,.22); margin:auto; overflow:hidden; }
        .modal-hero { background:linear-gradient(135deg,#1a1f6e,#3b4fd8); padding:24px 28px; }
        .detail-row { display:flex; align-items:flex-start; gap:10px;
          padding:11px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }
        .detail-row:last-child { border-bottom:none; }
        .d-icon { color:#3b4fd8; font-size:15px; margin-top:2px; flex-shrink:0; }
        .d-key { font-weight:700; color:#1e293b; min-width:120px; flex-shrink:0; }
        .d-val { color:#475569; word-break:break-all; }
        .sec-head { font-size:11px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#94a3b8; padding:14px 0 4px; }
        .doc-link { display:inline-flex; align-items:center; gap:6px;
          color:#3b4fd8; font-weight:700; text-decoration:none; font-size:13px; }
        .doc-link:hover { text-decoration:underline; }
        @media(max-width:768px){
          .hero-card { padding:28px 24px; }
          .grid-stats { grid-template-columns:1fr; }
          .hero-row { flex-direction:column; align-items:flex-start; gap:16px; }
        }
      `}</style>

      <div className="don-root" style={{ maxWidth:1100, margin:"0 auto",
        padding:"40px 20px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Hero */}
        <div className="hero-card">
          <div className="hero-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ zIndex:1, position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <FiHeart style={{ color:"#a5b4fc", fontSize:18 }}/>
                <span style={{ color:"#a5b4fc", fontSize:13, fontWeight:600,
                  letterSpacing:".08em", textTransform:"uppercase" }}>Donation Portal</span>
              </div>
              <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", margin:0, lineHeight:1.2 }}>
                My Donations
              </h1>
              <p style={{ color:"rgba(255,255,255,.65)", fontSize:14, margin:"8px 0 0" }}>
                Manage and track your contributions to our growing community.
              </p>
            </div>
            <Link to="/donations/new" className="add-btn">
              <FiPlus style={{ fontSize:16 }}/> New Donation
            </Link>
          </div>
        </div>

        {/* Stats — total only counts approved */}
        <div className="grid-stats">
          <div className="stat-card highlight">
            <div className="icon-wrap icon-white"><FiCreditCard/></div>
            <div>
              <p className="stat-label on-dark">Approved Total</p>
              <h3 className="stat-value on-dark">৳{stats.total.toFixed(2)}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrap icon-amber"><FiClock/></div>
            <div>
              <p className="stat-label">Pending Review</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon-wrap icon-green"><FiCheckCircle/></div>
            <div>
              <p className="stat-label">Approved</p>
              <h3 className="stat-value">{stats.approved}</h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        {donations.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16, alignItems:"stretch" }}>
            {/* Monthly bar chart */}
            <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px 16px",
              boxShadow:"0 2px 20px rgba(0,0,0,.06)", border:"1px solid rgba(255,255,255,.8)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <FiTrendingUp style={{ color:"#3b4fd8", fontSize:18 }}/>
                <span style={{ fontWeight:800, fontSize:16, color:"#0f172a" }}>Monthly Donations</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:12, fill:"#94a3b8", fontWeight:600 }}
                    axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `৳${v}`}/>
                  <Tooltip
                    contentStyle={{ borderRadius:12, border:"none", boxShadow:"0 8px 30px rgba(0,0,0,.12)",
                      fontSize:13, fontFamily:"inherit" }}
                    formatter={(val, name) => [`৳${Number(val).toFixed(2)}`, name]}/>
                  <Bar dataKey="approved" name="Approved" fill="#3b4fd8" radius={[6,6,0,0]} maxBarSize={40}/>
                  <Bar dataKey="pending"  name="Pending"  fill="#fbbf24" radius={[6,6,0,0]} maxBarSize={40}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status donut */}
            <div style={{ background:"#fff", borderRadius:20, padding:"28px 24px 16px", minWidth:220,
              boxShadow:"0 2px 20px rgba(0,0,0,.06)", border:"1px solid rgba(255,255,255,.8)",
              display:"flex", flexDirection:"column" }}>
              <div style={{ fontWeight:800, fontSize:16, color:"#0f172a", marginBottom:16 }}>
                Status Breakdown
              </div>
              <div style={{ flex:1, display:"flex", alignItems:"center" }}>
                <PieChart width={172} height={172}>
                  <Pie data={statusPie} cx={86} cy={86} innerRadius={50} outerRadius={76}
                    dataKey="value" paddingAngle={3}>
                    {statusPie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:10, border:"none",
                    boxShadow:"0 4px 16px rgba(0,0,0,.12)", fontSize:12, fontFamily:"inherit" }}
                    formatter={(val, name) => [val, name]}/>
                </PieChart>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                {statusPie.map(s => (
                  <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%",
                      background:s.fill, flexShrink:0 }}/>
                    <span style={{ color:"#64748b", flex:1 }}>{s.name}</span>
                    <span style={{ fontWeight:700, color:"#1e293b" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History table */}
        <div className="history-card">
          <div className="history-header">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <FiTrendingUp style={{ color:"#3b4fd8", fontSize:20 }}/>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>
                Donation History
              </h2>
            </div>
            <span style={{ background:"#f0f4ff", color:"#3b4fd8", borderRadius:20,
              padding:"4px 14px", fontSize:12, fontWeight:600 }}>
              {donations.length} record{donations.length!==1?"s":""}
            </span>
          </div>

          <div style={{ padding:"0 16px 16px" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 4px" }}>
              <thead>
                <tr className="table-head">
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}>
                    <div className="empty-state">
                      <p style={{ fontWeight:700, color:"#334155", fontSize:16, margin:0 }}>
                        Loading donations...
                      </p>
                    </div>
                  </td></tr>
                ) : donations.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon"><FiHeart/></div>
                      <p style={{ fontWeight:700, color:"#334155", fontSize:16, margin:"0 0 6px" }}>
                        No donations yet
                      </p>
                      <p style={{ color:"#94a3b8", fontSize:14, margin:"0 0 24px" }}>
                        Your donation history will appear here.
                      </p>
                      <Link to="/donations/new" className="add-btn"
                        style={{ margin:"0 auto", display:"inline-flex" }}>
                        <FiPlus/> Make Your First Donation
                      </Link>
                    </div>
                  </td></tr>
                ) : (
                  donations.map(d => {
                    const sc = statusStyle(d.status);
                    return (
                      <tr key={d._id} className="don-tr">
                        <td style={{ padding:"14px 20px" }}>
                          <div style={{ fontWeight:700, color:"#0f172a" }}>
                            {d.transactionId || "—"}
                          </div>
                          <div style={{ color:"#94a3b8", fontSize:12 }}>
                            {fmtDate(d.donationDate)}
                          </div>
                        </td>
                        <td style={{ padding:"14px 20px" }}>
                          <span style={{ fontSize:12, background:"#eef2ff", color:"#3730a3",
                            padding:"3px 10px", borderRadius:99, fontWeight:600 }}>
                            {d.category || "General"}
                          </span>
                        </td>
                        <td style={{ padding:"14px 20px", fontWeight:700 }}>
                          ৳{Number(d.amount||0).toFixed(2)}
                        </td>
                        <td style={{ padding:"14px 20px" }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5,
                            fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99,
                            background:sc.bg, color:sc.color }}>
                            <span style={{ width:5, height:5, borderRadius:"50%",
                              background:sc.dot, display:"inline-block" }}/>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding:"14px 20px" }}>
                          <button className="view-btn" onClick={()=>setSelected(d)}>
                            <FiEye style={{ fontSize:12 }}/> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {error && (
              <div style={{ padding:"0 20px 16px", color:"#ef4444", fontWeight:600 }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selected && (
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hero">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", fontWeight:600,
                    letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>
                    Donation Detail
                  </div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", margin:0 }}>
                    ৳{Number(selected.amount||0).toFixed(2)}
                  </h2>
                  <div style={{ color:"rgba(255,255,255,.65)", fontSize:13, marginTop:4 }}>
                    {fmtDate(selected.donationDate)}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {(() => { const sc=statusStyle(selected.status); return (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
                      fontSize:12, fontWeight:600, padding:"5px 14px", borderRadius:99,
                      background:"rgba(255,255,255,.15)", color:"#fff",
                      border:"1px solid rgba(255,255,255,.25)" }}>
                      <span style={{ width:5, height:5, borderRadius:"50%",
                        background:sc.dot, display:"inline-block" }}/>
                      {selected.status}
                    </span>
                  );})()}
                  <button onClick={()=>setSelected(null)}
                    style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)",
                      color:"#fff", borderRadius:"50%", width:34, height:34,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", fontSize:15 }}>
                    <FiX/>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding:"20px 28px 28px" }}>
              <div className="sec-head">Donation Information</div>
              <DR icon={<FiHash/>}         label="Transaction ID" val={selected.transactionId||"—"}/>
              <DR icon={<FiTag/>}          label="Category"       val={selected.category||"General"}/>
              <DR icon={<FiCalendar/>}     label="Date"           val={fmtDate(selected.donationDate)}/>
              {selected.message && (
                <DR icon={<FiMessageSquare/>} label="Message"    val={selected.message}/>
              )}
              {selected.receipt && (
                <DR icon={<FiFileText/>}   label="Receipt"
                  val={
                    <a href={selected.receipt.startsWith("http") ? selected.receipt : `${apiBase}/uploads/${selected.receipt}`}
                      target="_blank" rel="noopener noreferrer" className="doc-link">
                      <FiEye style={{fontSize:13}}/> View Receipt
                    </a>
                  }/>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function DR({ icon, label, val }) {
  return (
    <div className="detail-row">
      <span className="d-icon">{icon}</span>
      <span className="d-key">{label}</span>
      <span className="d-val">{val}</span>
    </div>
  );
}

export default Donations;