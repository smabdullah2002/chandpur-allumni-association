import React, { useEffect, useState } from "react";
import { CheckCircle, DollarSign, Tag, TrendingUp, Users } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const STATUS_COLORS = {
  Approved: "#4f46e5",
  Pending:  "#f59e0b",
  Rejected: "#ef4444",
};

const CAT_COLORS = ["#4f46e5","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];

export default function ImpactReport() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${apiBase}/api/stats/public`)
      .then(r => { if (!r.ok) throw new Error("Failed to load stats"); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const statusPie = data ? [
    { name: "Approved", value: data.statusCounts.approved },
    { name: "Pending",  value: data.statusCounts.pending  },
    { name: "Rejected", value: data.statusCounts.rejected },
  ].filter(d => d.value > 0) : [];

  const totalDonations = data
    ? data.statusCounts.approved + data.statusCounts.pending + data.statusCounts.rejected
    : 0;

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ir-root * { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing:border-box; }
        .ir-card { background:#fff; border-radius:20px;
          box-shadow:0 2px 24px rgba(0,0,0,.07); padding:28px 28px 20px; }
        .ir-stat { background:#fff; border-radius:16px;
          box-shadow:0 2px 16px rgba(0,0,0,.06);
          padding:24px 20px; display:flex; align-items:center; gap:16px; }
        .ir-stat:hover { transform:translateY(-3px);
          box-shadow:0 10px 32px rgba(79,70,229,.12); transition:all .25s; }
        .ir-icon { width:52px; height:52px; border-radius:14px; display:flex;
          align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
        @media(max-width:768px){
          .ir-grid-4 { grid-template-columns:1fr 1fr!important; }
          .ir-grid-3 { grid-template-columns:1fr!important; }
          .ir-hero-inner { flex-direction:column; align-items:flex-start!important; }
        }
        @media(max-width:480px){
          .ir-grid-4 { grid-template-columns:1fr!important; }
        }
      `}</style>

      <div className="ir-root" style={{ maxWidth:1140, margin:"0 auto",
        padding:"40px 20px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#1a1f6e 0%,#3730a3 45%,#4f46e5 100%)",
          borderRadius:24, padding:"44px 48px", position:"relative", overflow:"hidden",
          boxShadow:"0 20px 60px rgba(55,48,163,.35)" }}>
          <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280,
            background:"rgba(255,255,255,.05)", borderRadius:"50%", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-60, right:160, width:200, height:200,
            background:"rgba(255,255,255,.04)", borderRadius:"50%", pointerEvents:"none" }}/>
          <div className="ir-hero-inner" style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", gap:20, position:"relative", zIndex:1 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <TrendingUp style={{ color:"#a5b4fc", fontSize:18 }}/>
                <span style={{ color:"#a5b4fc", fontSize:12, fontWeight:700,
                  letterSpacing:".1em", textTransform:"uppercase" }}>
                  Transparency Report
                </span>
              </div>
              <h1 style={{ fontSize:34, fontWeight:800, color:"#fff", margin:"0 0 10px", lineHeight:1.15 }}>
                Impact Report
              </h1>
              <p style={{ color:"rgba(255,255,255,.7)", fontSize:15, margin:0, maxWidth:480 }}>
                A transparent view of how donations are collected and distributed
                across Matlab North and South communities.
              </p>
            </div>
            {data && (
              <div style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
                borderRadius:16, padding:"20px 28px", textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.65)", fontWeight:700,
                  letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>
                  Total Collected
                </div>
                <div style={{ fontSize:36, fontWeight:800, color:"#fff", lineHeight:1 }}>
                  ৳{data.totalAmount.toLocaleString()}
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginTop:6 }}>
                  from {totalDonations} submission{totalDonations !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:"80px 20px", color:"#94a3b8",
            fontWeight:600, fontSize:16 }}>
            Loading impact data…
          </div>
        )}

        {error && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#ef4444",
            fontWeight:600, fontSize:15 }}>
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div className="ir-grid-4" style={{ display:"grid",
              gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[
                { icon:<DollarSign/>, bg:"#eef2ff", color:"#4f46e5",
                  label:"Total Raised", val:`৳${data.totalAmount.toLocaleString()}` },
                { icon:<CheckCircle/>, bg:"#dcfce7", color:"#16a34a",
                  label:"Approved", val:data.statusCounts.approved },
                { icon:<TrendingUp/>, bg:"#fef9c3", color:"#ca8a04",
                  label:"Pending Review", val:data.statusCounts.pending },
                { icon:<Users/>, bg:"#ede9fe", color:"#7c3aed",
                  label:"Active Members", val:data.memberCount },
              ].map(s => (
                <div key={s.label} className="ir-stat">
                  <div className="ir-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8",
                      letterSpacing:".08em", textTransform:"uppercase", marginBottom:4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>
                      {s.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly trend + Status donut */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 230px", gap:16, alignItems:"stretch" }}>

              {/* Monthly area+bar chart */}
              <div className="ir-card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <TrendingUp style={{ color:"#4f46e5", fontSize:18 }}/>
                  <span style={{ fontWeight:800, fontSize:17, color:"#0f172a" }}>
                    Monthly Donation Trend
                  </span>
                </div>
                {data.monthly.length === 0 ? (
                  <div style={{ height:210, display:"flex", alignItems:"center",
                    justifyContent:"center", color:"#94a3b8", fontSize:14 }}>
                    No approved donations yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={210}>
                    <AreaChart data={data.monthly}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.18}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fontSize:12, fill:"#94a3b8", fontWeight:600 }}
                        axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                        tickFormatter={v => `৳${v}`} width={56}/>
                      <Tooltip
                        contentStyle={{ borderRadius:12, border:"none",
                          boxShadow:"0 8px 30px rgba(0,0,0,.12)", fontSize:13, fontFamily:"inherit" }}
                        formatter={(val, name) => [
                          name === "total" ? `৳${Number(val).toFixed(2)}` : val,
                          name === "total" ? "Amount" : "Donations",
                        ]}/>
                      <Area type="monotone" dataKey="total" name="total"
                        stroke="#4f46e5" strokeWidth={2.5}
                        fill="url(#areaGrad)" dot={{ r:4, fill:"#4f46e5", strokeWidth:0 }}
                        activeDot={{ r:6 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Status donut */}
              <div className="ir-card" style={{ display:"flex", flexDirection:"column",
                alignItems:"center", gap:16 }}>
                <div style={{ fontWeight:800, fontSize:16, color:"#0f172a", alignSelf:"flex-start" }}>
                  Status Breakdown
                </div>
                {statusPie.length === 0 ? (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                    color:"#94a3b8", fontSize:14 }}>No data yet</div>
                ) : (
                  <>
                    <PieChart width={174} height={174}>
                      <Pie data={statusPie} cx={87} cy={87} innerRadius={52} outerRadius={80}
                        dataKey="value" paddingAngle={3}>
                        {statusPie.map((e, i) => (
                          <Cell key={i} fill={STATUS_COLORS[e.name] || "#94a3b8"}/>
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius:10, border:"none",
                        boxShadow:"0 4px 16px rgba(0,0,0,.1)", fontSize:13, fontFamily:"inherit" }}/>
                    </PieChart>
                    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
                      {statusPie.map(s => (
                        <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                          <span style={{ width:10, height:10, borderRadius:"50%",
                            background:STATUS_COLORS[s.name], flexShrink:0 }}/>
                          <span style={{ color:"#64748b", flex:1 }}>{s.name}</span>
                          <span style={{ fontWeight:700, color:"#1e293b" }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Donations per month bar + Category breakdown */}
            <div className="ir-grid-3" style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr", gap:16 }}>

              {/* Count per month */}
              <div className="ir-card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <CheckCircle style={{ color:"#10b981", fontSize:18 }}/>
                  <span style={{ fontWeight:800, fontSize:17, color:"#0f172a" }}>
                    Donations per Month
                  </span>
                </div>
                {data.monthly.length === 0 ? (
                  <div style={{ height:190, display:"flex", alignItems:"center",
                    justifyContent:"center", color:"#94a3b8", fontSize:14 }}>
                    No data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8", fontWeight:600 }}
                        axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                        allowDecimals={false}/>
                      <Tooltip
                        contentStyle={{ borderRadius:10, border:"none",
                          boxShadow:"0 8px 24px rgba(0,0,0,.1)", fontSize:13, fontFamily:"inherit" }}
                        formatter={val => [val, "Donations"]}/>
                      <Bar dataKey="count" name="Donations" fill="#10b981"
                        radius={[6,6,0,0]} maxBarSize={44}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category breakdown horizontal bar */}
              <div className="ir-card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <Tag style={{ color:"#f59e0b", fontSize:18 }}/>
                  <span style={{ fontWeight:800, fontSize:17, color:"#0f172a" }}>
                    By Category (৳)
                  </span>
                </div>
                {data.categories.length === 0 ? (
                  <div style={{ height:190, display:"flex", alignItems:"center",
                    justifyContent:"center", color:"#94a3b8", fontSize:14 }}>
                    No approved donations yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={data.categories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                      <XAxis type="number" tick={{ fontSize:10, fill:"#94a3b8" }}
                        axisLine={false} tickLine={false} tickFormatter={v => `৳${v}`}/>
                      <YAxis type="category" dataKey="name" width={76}
                        tick={{ fontSize:11, fill:"#475569", fontWeight:600 }}
                        axisLine={false} tickLine={false}/>
                      <Tooltip
                        contentStyle={{ borderRadius:10, border:"none",
                          boxShadow:"0 8px 24px rgba(0,0,0,.1)", fontSize:13, fontFamily:"inherit" }}
                        formatter={val => [`৳${Number(val).toFixed(2)}`, "Total"]}/>
                      <Bar dataKey="total" name="Total" radius={[0,6,6,0]} maxBarSize={22}>
                        {data.categories.map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
