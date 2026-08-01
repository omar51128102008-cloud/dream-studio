"use client";

import { useState } from "react";
import { MarkIcon } from "@/components/icons";

export default function Contact() {
  const [note, setNote] = useState("");
  const [noteOk, setNoteOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNote(
      "Thanks — we've received your message and will reply within 48 hours."
    );
    setNoteOk(true);
    e.currentTarget.reset();
  }

  return (
    <section id="contact" className="section-pad">
      <div className="container contact-grid">
        <div>
          <div className="eyebrow reveal">
            <MarkIcon />
            GET IN TOUCH
          </div>
          <h2 className="reveal">Let&apos;s create something timeless.</h2>
          <p className="lede reveal reveal-delay-1">
            Tell us about your wedding, brand, or project — we&apos;ll get back
            to you within 48 hours with next steps and availability.
          </p>

          <div className="reveal reveal-delay-2">
            <div className="info-row">
              <div className="k">Studio</div>
              <div className="v">Ramallah, Palestine</div>
            </div>
            <div className="info-row">
              <div className="k">Email</div>
              <div className="v">
                <a href="mailto:hello@dreamstudio.ps">hello@dreamstudio.ps</a>
              </div>
            </div>
            <div className="info-row">
              <div className="k">Phone</div>
              <div className="v">
                <a href="tel:+970590000000">+970 59 000 0000</a>
              </div>
            </div>
          </div>

          <div className="socials reveal reveal-delay-2">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
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
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="6" width="18" height="12" rx="3" />
                <path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <form id="contactForm" className="reveal reveal-delay-1" onSubmit={onSubmit}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="fname">Name</label>
              <input
                id="fname"
                name="name"
                type="text"
                required
                placeholder="Your full name"
              />
            </div>
            <div className="field">
              <label htmlFor="femail">Email</label>
              <input
                id="femail"
                name="email"
                type="email"
                required
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ftype">Project Type</label>
            <select id="ftype" name="type">
              <option>Wedding</option>
              <option>Portrait Session</option>
              <option>Brand / Commercial</option>
              <option>Event</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="fmsg">Message</label>
            <textarea
              id="fmsg"
              name="message"
              required
              placeholder="Tell us about your date, location, and vision..."
            />
          </div>
          <button type="submit" className="btn solid">
            Send Message
          </button>
          <p id="formNote" className={noteOk ? "ok" : ""}>
            {note}
          </p>
        </form>
      </div>
    </section>
  );
}
