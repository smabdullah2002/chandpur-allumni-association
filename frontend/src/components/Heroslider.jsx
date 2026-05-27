import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HeroSlider.css";

// ─── Drop-in replacement hero slider ───────────────────────────────────────
// Props: slides = heroSlides array from siteData
export default function HeroSlider({ slides }) {
  const { auth } = useAuth();
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (index, dir = "next") => {
      if (isAnimating || index === active) return;
      setDirection(dir);
      setPrev(active);
      setActive(index);
      setIsAnimating(true);
    },
    [active, isAnimating]
  );

  const goNext = useCallback(() => {
    goTo((active + 1) % slides.length, "next");
  }, [active, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((active - 1 + slides.length) % slides.length, "prev");
  }, [active, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(goNext, 5000);
    return () => clearInterval(timerRef.current);
  }, [goNext]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 5000);
  };

  const handleNext = () => { goNext(); resetTimer(); };
  const handlePrev = () => { goPrev(); resetTimer(); };
  const handleDot = (i) => {
    goTo(i, i > active ? "next" : "prev");
    resetTimer();
  };

  const slide = slides[active];
  const prevSlide = prev !== null ? slides[prev] : null;

  return (
    <section
      className="hs-stage"
      onAnimationEnd={() => setIsAnimating(false)}
    >
      {/* ── Background layers ── */}
      {prevSlide && (
        <div
          key={`bg-prev-${prev}`}
          className={`hs-bg hs-bg--exit hs-bg--exit-${direction}`}
          style={{ backgroundImage: `url(${prevSlide.image})` }}
        />
      )}
      <div
        key={`bg-${active}`}
        className={`hs-bg${prev !== null ? ` hs-bg--enter hs-bg--enter-${direction}` : ""}`}
        style={{ backgroundImage: `url(${slide.image})` }}
        onAnimationEnd={() => { setIsAnimating(false); setPrev(null); }}
      />
      <div className="hs-gradient" />

      {/* ── Decorative corner mark ── */}
      <div className="hs-corner-mark" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="36" cy="36" r="22" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="36" y1="1" x2="36" y2="71" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="1" y1="36" x2="71" y2="36" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </svg>
      </div>

      {/* ── Slide number badge ── */}
      <div className="hs-slide-count" aria-hidden="true">
        <span className="hs-count-current">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="hs-count-divider" />
        <span className="hs-count-total">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="hs-content-wrap">
        <div
          key={`content-${active}`}
          className={`hs-content hs-content--enter-${direction}`}
        >
          <span className="hs-tag">{slide.tag}</span>
          <h1 className="hs-title">{slide.title}</h1>
          <p className="hs-desc">{slide.description}</p>
          <div className="hs-actions">
            <Link to="/about" className="hs-btn hs-btn--ghost">
              Our Mission
            </Link>
            {!auth ? (
              <Link to="/register" className="hs-btn hs-btn--solid">
                Join Our Community
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="hs-progress-track" aria-hidden="true">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hs-progress-seg ${i === active ? "active" : ""}`}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className={`hs-progress-fill ${i === active ? "running" : ""}`}
            />
          </button>
        ))}
      </div>

      {/* ── Arrows ── */}
      <div className="hs-arrows">
        <button
          type="button"
          className="hs-arrow"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="hs-arrow"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

    </section>
  );
}