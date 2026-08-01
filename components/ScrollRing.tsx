"use client";

import { useEffect, useRef } from "react";

export default function ScrollRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const prog = progRef.current;
    const toTop = document.getElementById("toTop");
    if (!ring || !prog || !toTop) return;

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      ring.classList.toggle("show", y > 400);
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (y / total) * 100 : 0;
      prog.style.strokeDashoffset = (100 - pct).toString();
    };
    const onClick = () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("scroll", onScroll);
      toTop.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div id="scrollRing" ref={ringRef}>
      <svg viewBox="0 0 46 46">
        <circle className="track" cx="23" cy="23" r="20" />
        <circle
          ref={progRef}
          className="prog"
          cx="23"
          cy="23"
          r="20"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100}
        />
      </svg>
      <button id="toTop" aria-label="Back to top">
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
