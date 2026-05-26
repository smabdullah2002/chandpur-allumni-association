import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, MapPin, X } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { heroSlides, trustPoints } from "../data/siteData";
import HeroSlider from "../components/Heroslider";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function fmtDateFull(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function statusLabel(s) {
  if (s === "past") return "Past Event";
  if (s === "cancelled") return "Cancelled";
  return "Upcoming";
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [slides, setSlides] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setSelectedEvent(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    fetch(`${apiBase}/api/events`)
      .then(r => r.json())
      .then(data => setEvents((data.events || []).slice(0, 3)))
      .catch(() => setEvents([]));

    fetch(`${apiBase}/api/sliders`)
      .then(r => r.json())
      .then(data => {
        const list = (data.sliders || data || [])
          .filter(s => s.status === "visible")
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(s => ({
            image: s.imageUrl,
            tag: s.ctaText || "Chandpur Allumni Association- Jahangirnagar University",
            title: s.headline || "",
            description: s.subtext || "",
          }));
        setSlides(list.length > 0 ? list : heroSlides);
      })
      .catch(() => setSlides(heroSlides));
  }, []);

  const fmtDate = iso => new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short",
  });

  const activeSlides = slides || heroSlides;

  return (
    <div className="home-page">
      <HeroSlider slides={activeSlides} />

      <section className="section about-preview">
        <div className="container about-grid">
          <div className="about-image-card">
            <img src="/Cover-photo2.jpg" alt="Volunteers supporting the community" />
            <div className="floating-stat">
              <strong>10+ Years</strong>
              <span>Of dedicated service to humanity</span>
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="About"
              title="ভূমিকা"
              description="মননে মতলব একটি অরাজনৈতিক প্ল্যাটফর্ম। এটি মতলব উত্তর ও দক্ষিণের মানুষকে একটি সুস্পষ্ট লক্ষ্য নিয়ে একত্র করে।"
              align="left"
            />
            <p className="copy-block">
              আমাদের উদ্দেশ্য হল শিক্ষা, স্বাস্থ্য, সমতা এবং সহযোগিতার মাধ্যমে
              সমাজে বাস্তব পরিবর্তন আনা। আমরা দায়িত্বশীলভাবে তহবিল, ইভেন্ট এবং
              সহায়তা কার্যক্রম পরিচালনা করি।
            </p>
            <div className="trust-grid">
              {trustPoints.map((point) => (
                <div key={point} className="trust-item">
                  <CheckCircle style={{ color: "var(--primary)", flexShrink: 0 }} />
                  {point}
                </div>
              ))}
            </div>
            <div className="stats-row">
              <div className="stat-card"><span>6+</span><p>Active Volunteers</p></div>
              <div className="stat-card"><span>1k+</span><p>People Reached</p></div>
            </div>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="section muted-section">
          <div className="container">
            <SectionTitle
              eyebrow="Get Involved"
              title="Upcoming Impact Events"
              description="Join our community events and witness firsthand how your contributions are making a difference."
            />
            <div className="event-grid">
              {events.map(event => (
                <article
                  key={event._id}
                  className="event-card"
                  onClick={() => setSelectedEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setSelectedEvent(event)}
                >
                  <div className="event-date">{fmtDate(event.date)}</div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedEvent && (
        <div className="ev-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="ev-modal" onClick={e => e.stopPropagation()}>
            <div className="ev-modal-hero">
              <button className="ev-modal-close" onClick={() => setSelectedEvent(null)}>
                <X />
              </button>
              <div className="ev-modal-date">
                <Calendar style={{ fontSize: 12 }} />
                {fmtDateFull(selectedEvent.date)}
              </div>
              <h2 className="ev-modal-title">{selectedEvent.title}</h2>
            </div>
            <div className="ev-modal-body">
              <div className="ev-modal-meta">
                {selectedEvent.location && (
                  <span className="ev-meta-pill location">
                    <MapPin style={{ fontSize: 11 }} />
                    {selectedEvent.location}
                  </span>
                )}
                <span className={`ev-meta-pill status-${selectedEvent.status}`}>
                    <Clock style={{ fontSize: 11 }} />
                  {statusLabel(selectedEvent.status)}
                </span>
              </div>
              {selectedEvent.description && (
                <p className="ev-modal-desc">{selectedEvent.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
