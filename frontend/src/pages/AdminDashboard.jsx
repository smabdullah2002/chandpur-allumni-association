import React from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiBell,
  FiCreditCard,
  FiShield,
  FiInfo,
  FiImage,
  FiCalendar,
  FiTag,
  FiSettings,
  FiUserCheck,
} from "react-icons/fi";

const sections = [
  {
    heading: "Members",
    items: [
      {
        title: "Manage Users",
        description: "Review new registrations and manage member accounts.",
        icon: <FiUsers />,
        to: "/admin/users",
        accent: "#3b4fd8",
        bg: "#eef1ff",
      },
      {
        title: "Manage Roles",
        description: "Assign and configure roles and permissions.",
        icon: <FiUserCheck />,
        to: "/admin/roles",
        accent: "#8b5cf6",
        bg: "#f5f3ff",
      },
    ],
  },
  {
    heading: "Finance",
    items: [
      {
        title: "All Donations",
        description: "Approve or reject submitted donation entries.",
        icon: <FiCreditCard />,
        to: "/admin/donations",
        accent: "#10b981",
        bg: "#edfcf3",
      },
      {
        title: "Fee Categories",
        description: "Define and manage membership fee categories.",
        icon: <FiTag />,
        to: "/admin/fee-categories",
        accent: "#f59e0b",
        bg: "#fff8ec",
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        title: "Manage Notices",
        description: "Create, edit, and publish announcements to members.",
        icon: <FiBell />,
        to: "/admin/notices",
        accent: "#ef4444",
        bg: "#fff1f2",
      },
      {
        title: "Manage Events",
        description: "Schedule and publish upcoming events.",
        icon: <FiCalendar />,
        to: "/admin/events",
        accent: "#0ea5e9",
        bg: "#f0f9ff",
      },
      {
        title: "Manage Sliders",
        description: "Update homepage banner slides and images.",
        icon: <FiImage />,
        to: "/admin/sliders",
        accent: "#ec4899",
        bg: "#fdf2f8",
      },
      {
        title: "Photo Gallery",
        description: "Upload and manage community photos.",
        icon: <FiImage />,
        to: "/admin/gallery",
        accent: "#0ea5e9",
        bg: "#f0f9ff",
      },
    ],
  },
  {
    heading: "Settings",
    items: [
      {
        title: "About Us",
        description: "Update the public About Us page content.",
        icon: <FiInfo />,
        to: "/admin/about",
        accent: "#6366f1",
        bg: "#eef2ff",
      },
      {
        title: "Site Settings",
        description: "Configure global site settings and preferences.",
        icon: <FiSettings />,
        to: "/admin/sliders",
        accent: "#64748b",
        bg: "#f1f5f9",
      },
    ],
  },
];

export default function AdminDashboard() {
  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; }

        .hero-orb-1 {
          position: absolute; right: -60px; top: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.07); pointer-events: none;
        }
        .hero-orb-2 {
          position: absolute; right: 80px; bottom: -80px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }

        .admin-card {
          background: #fff;
          border-radius: 16px;
          padding: 22px;
          border: 1px solid #eef2ff;
          box-shadow: 0 4px 16px rgba(15,19,64,0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .admin-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(15,19,64,0.11);
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        @media (max-width: 700px) {
          .section-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .section-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={styles.inner}>
        {/* ── Hero ── */}
        <div style={styles.hero}>
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div style={styles.heroBadge}>
            <FiShield style={{ fontSize: 12 }} />
            Admin Console
          </div>
          <h1 style={styles.heroTitle}>Admin Dashboard</h1>
          <p style={styles.heroSub}>
            Manage members, finances, content, and site settings from one place.
          </p>

          {/* Quick stats */}
          <div style={styles.heroStats}>
            {[
              { label: "Total Sections", value: "4" },
              { label: "Management Tools", value: "9" },
              { label: "Quick Access", value: "All" },
            ].map((s) => (
              <div key={s.label} style={styles.heroStat}>
                <div style={styles.heroStatValue}>{s.value}</div>
                <div style={styles.heroStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.heading}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionLine} />
              <span style={styles.sectionLabel}>{section.heading}</span>
            </div>
            <div className="section-grid">
              {section.items.map((card) => (
                <Link className="admin-card" key={card.title} to={card.to}>
                  <div
                    style={{
                      ...styles.cardIcon,
                      background: card.bg,
                      color: card.accent,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p style={styles.cardTitle}>{card.title}</p>
                    <p style={styles.cardDesc}>{card.description}</p>
                  </div>
                  <div style={{ ...styles.cardArrow, color: card.accent }}>
                    Manage →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f8",
    padding: "32px 20px",
  },
  inner: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },

  /* Hero */
  hero: {
    background:
      "linear-gradient(135deg, #0f1340 0%, #1a1f6e 55%, #2a3190 100%)",
    borderRadius: "20px",
    padding: "36px 40px",
    color: "#fff",
    boxShadow: "0 20px 60px rgba(15,19,64,0.3)",
    position: "relative",
    overflow: "hidden",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "5px 13px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    margin: "0 0 6px",
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    margin: "0 0 24px",
  },
  heroStats: {
    display: "flex",
    gap: 0,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    overflow: "hidden",
    width: "fit-content",
  },
  heroStat: {
    padding: "12px 24px",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
  },
  heroStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
    letterSpacing: "0.04em",
  },

  /* Section heading */
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionLine: {
    display: "block",
    width: 3,
    height: 16,
    borderRadius: 2,
    background: "linear-gradient(180deg, #3b4fd8, #6366f1)",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  /* Card */
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  cardArrow: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: "auto",
  },
};
