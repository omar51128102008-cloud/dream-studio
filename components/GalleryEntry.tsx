"use client";

import { useEffect, useState } from "react";

const STORAGE_PREFIX = "dreamstudio:entered:";

export default function GalleryEntry({
  clientNames,
  previewUrl,
  token,
  children,
}: {
  clientNames: string;
  previewUrl?: string;
  token: string;
  children: React.ReactNode;
}) {
  const [entered, setEntered] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(`${STORAGE_PREFIX}${token}`) === "1";
    } catch {
      seen = true;
    }
    setEntered(seen);
  }, [token]);

  if (entered === null) {
    return null;
  }

  if (entered) {
    return <>{children}</>;
  }

  function begin() {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${token}`, "1");
    } catch {
      // storage unavailable — just proceed
    }
    setEntered(true);
  }

  return (
    <div className="gallery-entry">
      <div className="gallery-entry-bg">
        {previewUrl ? <img src={previewUrl} alt="" /> : null}
      </div>
      <div className="gallery-entry-overlay" />
      <img
        className="gallery-entry-mark"
        src="/logo-light.png"
        alt=""
        aria-hidden="true"
      />
      <div className="gallery-entry-content">
        <span className="gallery-entry-eyebrow">Dream Studio</span>
        <h1 className="gallery-entry-title">{clientNames}</h1>
        <p className="gallery-entry-welcome">
          Your gallery is ready. Take your time — mark your favorites and leave
          a note on any photo that speaks to you.
        </p>
        <button className="btn-begin" onClick={begin}>
          Begin
        </button>
      </div>
    </div>
  );
}
