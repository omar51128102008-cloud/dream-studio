"use client";

import { useEffect, useState } from "react";

const PIN_STORAGE_PREFIX = "dreamstudio:pin:";

function hasSessionPin(token: string): boolean {
  try {
    return sessionStorage.getItem(`${PIN_STORAGE_PREFIX}${token}`) === "1";
  } catch {
    return false;
  }
}

export default function GalleryGate({
  token,
  hasPin,
  clientNames,
  previewUrl,
  children,
}: {
  token: string;
  hasPin: boolean;
  clientNames: string;
  previewUrl?: string;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(!hasPin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (hasPin && hasSessionPin(token)) {
      setUnlocked(true);
    }
  }, [hasPin, token]);

  if (unlocked) {
    return <>{children}</>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checking || pin.length === 0) return;
    setError(null);
    setChecking(true);
    try {
      const res = await fetch("/api/gallery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });
      if (res.ok) {
        try {
          sessionStorage.setItem(`${PIN_STORAGE_PREFIX}${token}`, "1");
        } catch {
          // storage unavailable — unlock for this render anyway
        }
        setUnlocked(true);
      } else {
        let msg = "That PIN isn't correct. Please try again.";
        try {
          const body = await res.json();
          if (body && typeof body.error === "string" && body.error) {
            msg = body.error;
          }
        } catch {
          // fall back to the generic message
        }
        setError(msg);
      }
    } catch {
      setError("We couldn't check the PIN right now. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="gallery-entry gallery-pin">
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
      <form className="gallery-pin-card" onSubmit={submit}>
        <span className="gallery-entry-eyebrow">Dream Studio</span>
        <h1 className="gallery-pin-title">Private gallery</h1>
        <p className="gallery-pin-hint">
          {clientNames
            ? `Enter the access PIN for ${clientNames}'s gallery to continue.`
            : "Enter the access PIN to continue."}
        </p>
        <input
          className="gallery-pin-input"
          type="password"
          autoComplete="current-password"
          placeholder="Enter the access PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          aria-label="Access PIN"
          autoFocus
        />
        {error && (
          <p className="gallery-pin-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn-begin"
          disabled={checking || pin.length === 0}
        >
          {checking ? "Checking…" : "Unlock gallery"}
        </button>
      </form>
    </div>
  );
}
