import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Check, Facebook, Instagram, Linkedin, LogOut, Send, Twitter, User, X } from "lucide-react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { auth, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [newsletter, setNewsletter] = useState({ email: "", status: "idle", message: "" });
  const dropdownRef = useRef(null);
  const location = useLocation();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    setNavOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const displayName = auth?.user?.fullName || auth?.user?.email || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const profileImage = auth?.user?.profileImage;
  // Handle both Cloudinary full URLs and local upload paths
  const profileImageUrl = profileImage
    ? profileImage.startsWith("http")
      ? profileImage
      : `${apiBase}/uploads/${profileImage}`
    : "";
  const showImage = Boolean(profileImageUrl) && !imageError;

  const commonLinks = [
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const publicLinks = [
    { to: "/", label: "Home" },
    ...commonLinks,
    { to: "/events", label: "Events" },
    { to: "/gallery", label: "Gallery" },
  ];

  const userLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/donations", label: "Donations" },
    { to: "/notice", label: "Notice" },
    { to: "/gallery", label: "Gallery" },
    ...commonLinks,
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/donations", label: "Donations" },
    { to: "/admin/notices", label: "Notices" },
    { to: "/admin/about", label: "About" },
  ];

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletter.email) return;
    setNewsletter((p) => ({ ...p, status: "loading" }));
    try {
      const res = await fetch(`${apiBase}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletter.email }),
      });
      const data = await res.json();
      setNewsletter({ email: "", status: res.ok ? "success" : "error", message: data.message });
    } catch {
      setNewsletter((p) => ({ ...p, status: "error", message: "Connection error. Please try again." }));
    }
  };

  const isMember = auth?.user?.role === "user" || auth?.user?.role === "member";
  const navLinks = auth?.user
    ? isMember
      ? userLinks
      : auth?.user?.role === "super-admin"
        ? adminLinks
        : publicLinks
    : publicLinks;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <img
              src="/logo.png"
              alt="Chandpur Allumni Association- Jahangirnagar University logo"
              className="brand-logo"
            />
          </Link>
          <nav className="main-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            {auth ? (
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  className="welcome-pill"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="avatar-circle">
                    {showImage ? (
                      <img
                        src={profileImageUrl}
                        alt={displayName}
                        className="avatar-img"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="avatar-initials">{initials}</span>
                    )}
                  </span>
                  <span className="avatar-name">{displayName}</span>
                </button>
                {isDropdownOpen && (
                  <div className="profile-menu">
                    <Link
                      to="/profile"
                      className="profile-menu-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                        <User className="profile-menu-icon" /> Profile
                    </Link>
                    <div className="profile-menu-divider" />
                    <button
                      type="button"
                      className="profile-menu-item danger"
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <LogOut className="profile-menu-icon" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-button">
                  Sign In
                </Link>
                <Link to="/register" className="primary-button">
                  Join Now
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className={`hamburger${navOpen ? " open" : ""}`}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </header>

      <div
        className={`mobile-nav-overlay${navOpen ? " open" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`mobile-nav-drawer${navOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        <button
          type="button"
          className="mobile-nav-close"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        >
            <X />
        </button>
        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-nav-actions">
          {auth ? (
            <>
                <Link to="/profile" className="primary-button">
                  <User /> Profile
                </Link>
              <button
                type="button"
                className="text-button"
                style={{ color: "#ef4444" }}
                onClick={() => logout()}
              >
                  <LogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-button">Sign In</Link>
              <Link to="/register" className="primary-button">Join Now</Link>
            </>
          )}
        </div>
      </div>

      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <img
              src="/logo.png"
              alt="Chandpur Allumni Association- Jahangirnagar University logo"
              className="footer-logo"
            />
            <p className="footer-copy">
              A transparent and impactful donation platform dedicated to
              connecting hearts and changing lives across local communities.
            </p>
            <div className="social-row">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="LinkedIn">
                <Linkedin />
              </a>
            </div>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/events">Upcoming Events</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>How It Works</h3>
            <ul className="footer-links">
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/donations">Make a Donation</Link></li>
              <li><Link to="/about">Fundraising Tips</Link></li>
              <li><Link to="/impact">Impact Reports</Link></li>
            </ul>
          </div>
          <div>
            <h3>Newsletter</h3>
            <p className="footer-copy">
              Stay updated with our latest impact stories and upcoming events.
            </p>
            {newsletter.status === "success" ? (
              <div className="newsletter-success">
                <Check className="newsletter-success-icon" />
                <span>{newsletter.message}</span>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="Email Address"
                  aria-label="Email Address"
                  value={newsletter.email}
                  onChange={(e) => setNewsletter((p) => ({ ...p, email: e.target.value, status: "idle", message: "" }))}
                  required
                />
                <button type="submit" disabled={newsletter.status === "loading"} aria-label="Subscribe">
                  <Send />
                </button>
              </form>
            )}
            {newsletter.status === "error" && (
              <p className="newsletter-error">
                <AlertCircle /> {newsletter.message}
              </p>
            )}
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Chandpur Allumni Association- Jahangirnagar University. All rights reserved.</span>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            background:"#fff", border:"1.5px solid #c7d2fe",
            color:"#334155", padding:"3px 14px", borderRadius:99,
            fontSize:12, fontWeight:600, letterSpacing:".02em",
          }}>
            Developed by{" "}
            <a
              href="https://rantechbd.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background:"linear-gradient(135deg,#1a1f6e,#4f46e5)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                textDecoration:"none", fontWeight:800,
              }}
            >
              Rantech
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
