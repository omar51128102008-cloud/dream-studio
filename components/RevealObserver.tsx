"use client";

import { useEffect } from "react";

export default function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const revealEls = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && !reduced) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
      return () => io.disconnect();
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  return null;
}
