"use client";

import { useEffect, useRef } from "react";

export default function CursorRing() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ring.style.opacity = "1";
    let rx = 0;
    let ry = 0;
    let mx = 0;
    let my = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      raf = requestAnimationFrame(loop);
    };

    const targets = document.querySelectorAll("a, button, .g-item");
    const grow = () => ring.classList.add("grow");
    const ungrow = () => ring.classList.remove("grow");

    window.addEventListener("mousemove", onMove);
    targets.forEach((el) => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", ungrow);
    });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", ungrow);
      });
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div id="cursorRing" ref={ringRef} />;
}
