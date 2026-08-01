const footerLinks = [
  ["#work", "Work"],
  ["#about", "About"],
  ["#services", "Services"],
  ["#testimonials", "Testimonials"],
  ["#contact", "Contact"],
];

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <img src="/logo-light.png" alt="Dream Studio" />
          <nav className="footer-nav">
            {footerLinks.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2008–2026 Dream Studio. All rights reserved.</p>
          <div className="socials">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24">
                <path d="M14 9h3V5.5h-3c-2 0-3.5 1.5-3.5 3.5v2H8V14h2.5v6h3v-6H16l.5-3h-3V9c0-.6.4-1 1-1z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg viewBox="0 0 24 24">
                <path d="M14 4v9.5a3 3 0 1 1-2.4-2.94" />
                <path d="M14 4c.3 2.2 1.8 3.7 4 4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
