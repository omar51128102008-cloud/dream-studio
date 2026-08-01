import { MarkIcon } from "@/components/icons";

export default function Services() {
  return (
    <section id="services" className="section-pad">
      <div className="container">
        <div className="head">
          <div className="eyebrow on-dark reveal">
            <MarkIcon />
            SERVICES
          </div>
          <h2 className="reveal">What We Do</h2>
        </div>
        <div className="services-grid">
          <div className="service-card reveal">
            <span className="idx">Photography</span>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <h3>Photography</h3>
            <p>
              Weddings, portraits, events and studio sessions shot with a
              documentary eye and a refined, timeless finish.
            </p>
          </div>
          <div className="service-card reveal reveal-delay-1">
            <span className="idx">Videography</span>
            <svg className="icon" viewBox="0 0 24 24">
              <rect x="3" y="6" width="13" height="12" rx="1" />
              <path d="M16 10l5-3v10l-5-3z" />
            </svg>
            <h3>Videography</h3>
            <p>
              Cinematic wedding films, brand stories and short documentaries
              built around real moments, not staged ones.
            </p>
          </div>
          <div className="service-card reveal reveal-delay-2">
            <span className="idx">Post-Production</span>
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="8" cy="12" r="3.2" />
              <circle cx="16" cy="7.5" r="1.6" />
              <circle cx="16" cy="16.5" r="1.6" />
              <path d="M10.7 10.7l3.6-2.5M10.7 13.3l3.6 2.5" />
            </svg>
            <h3>Post-Production</h3>
            <p>
              Color grading, retouching and edit — every frame refined until it
              feels like it was always meant to look this way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
