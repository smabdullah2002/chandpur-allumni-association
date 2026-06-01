import React, { useEffect, useState } from "react";
import { MapPin, Book, Phone, PhoneOff } from "lucide-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function MembersList() {
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
