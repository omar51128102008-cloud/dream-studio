"use client";

import { useSyncExternalStore, useState } from "react";

const STORAGE_PREFIX = "dreamstudio:entered:";

const emptySubscribe = () => () => {};

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
  const [dismissed, setDismissed] = useState(false);

  const seen = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem(`${STORAGE_PREFIX}${token}`) === "1";
      } catch {
        return true;
      }
    },
    () => false
  );

  if (dismissed || seen) {
    return <>{children}</>;
  }

  function begin() {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${token}`, "1");
    } catch {
      // storage unavailable — just proceed
    }
    setDismissed(true);
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
