import React, { useEffect, useState } from "react";
import { FiX, FiMapPin, FiCalendar, FiClock } from "react-icons/fi";
import SectionTitle from "../components/SectionTitle";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short",
  });
}

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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${apiBase}/api/events`)
      .then(r => r.json())
      .then(data => setEvents(data.events || []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="page-section">
      <div className="container">
        <SectionTitle
          eyebrow="Get Involved"
          title="Upcoming Impact Events"
          description="Join our community events and witness firsthand how your contributions are making a difference."
        />
        {events.length > 0 ? (
          <div className="event-grid">
            {events.map(event => (
              <article
                key={event._id}
                className="event-card"
                onClick={() => setSelected(event)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && setSelected(event)}
              >
                <div className="event-date">{fmtDate(event.date)}</div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>
            No upcoming events at the moment.
          </p>
        )}
      </div>

      {selected && (
        <div className="ev-overlay" onClick={() => setSelected(null)}>
          <div className="ev-modal" onClick={e => e.stopPropagation()}>
            <div className="ev-modal-hero">
              <button className="ev-modal-close" onClick={() => setSelected(null)}>
                <FiX />
              </button>
              <div className="ev-modal-date">
                <FiCalendar style={{ fontSize: 12 }} />
                {fmtDateFull(selected.date)}
              </div>
              <h2 className="ev-modal-title">{selected.title}</h2>
            </div>
            <div className="ev-modal-body">
              <div className="ev-modal-meta">
                {selected.location && (
                  <span className="ev-meta-pill location">
                    <FiMapPin style={{ fontSize: 11 }} />
                    {selected.location}
                  </span>
                )}
                <span className={`ev-meta-pill status-${selected.status}`}>
                  <FiClock style={{ fontSize: 11 }} />
                  {statusLabel(selected.status)}
                </span>
              </div>
              {selected.description && (
                <p className="ev-modal-desc">{selected.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
