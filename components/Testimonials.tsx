"use client";

import { useEffect, useRef, useState } from "react";
import { MarkIcon } from "@/components/icons";

const slides = [
  {
    quote:
      "Dream Studio didn't just photograph our wedding — they disappeared into it. We forgot the camera was even there, and the film they gave us back felt like watching the day happen all over again.",
    who: "Lina & Omar — Wedding Clients",
  },
  {
    quote:
      "We've worked with a lot of production houses for our campaigns. None of them slow down and actually look the way this team does. Every frame feels considered.",
    who: "Yousef Haddad — Brand Manager, Olive & Stone Co.",
  },
  {
    quote:
      "From the first meeting to the final delivery, it felt personal. Seventeen years of experience shows in how calm they are behind the lens, even in chaos.",
    who: "Rana Kareem — Bride",
  },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function show(n: number) {
    setIdx((n + slides.length) % slides.length);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timerRef.current = setInterval(() => show(idx + 1), 7000);
    }
  }

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <section id="testimonials" className="section-pad">
      <div className="container">
        <div
          className="eyebrow on-dark reveal"
          style={{ justifyContent: "center" }}
        >
          <MarkIcon />
          CLIENT WORDS
        </div>
        <h2 className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          What They Say
        </h2>
        <div className="t-wrap">
          {slides.map((s, i) => (
            <div key={i} className={i === idx ? "t-slide active" : "t-slide"}>
              <p className="quote">{s.quote}</p>
              <p className="who">{s.who}</p>
            </div>
          ))}
          <div className="t-controls">
            <button
              id="tPrev"
              aria-label="Previous testimonial"
              onClick={() => {
                show(idx - 1);
                resetTimer();
              }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div className="t-dots" id="tDots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={i === idx ? "active" : ""}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => {
                    show(i);
                    resetTimer();
                  }}
                />
              ))}
            </div>
            <button
              id="tNext"
              aria-label="Next testimonial"
              onClick={() => {
                show(idx + 1);
                resetTimer();
              }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
