"use client";

import { useEffect, useState } from "react";

const navLinks = [
  ["#work", "Work"],
  ["#about", "About"],
  ["#services", "Services"],
  ["#testimonials", "Testimonials"],
  ["#contact", "Contact"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > window.innerHeight * 0.9);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header id="siteNav" className={scrolled ? "scrolled" : ""}>
        <div className="container">
          <a href="#hero" className="logo-wrap" aria-label="Dream Studio home">
            <img className="logo-light" src="/logo-light.png" alt="Dream Studio" />
            <img className="logo-dark" src="/logo-dark.png" alt="Dream Studio" />
          </a>
          <nav className="links">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nav-cta">
            <a href="#contact" className="btn desktop-only">
              Book a Session
            </a>
            <button
              id="menuToggle"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobileMenu" className={menuOpen ? "open" : ""}>
        <button
          className="close"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
