"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default function GateForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = safeNext(searchParams.get("next"));
        return;
      }
      setError("Incorrect password. Please try again.");
    } catch {
      setError("We couldn't check the password. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="gate">
      <img
        className="gate-mark"
        src="/logo-light.png"
        alt=""
        aria-hidden="true"
      />
      <span className="gate-eyebrow">Dream Studio</span>
      <h1 className="gate-title">Private access</h1>
      <p className="gate-sub">This site is password protected.</p>
      <form className="gate-form" onSubmit={handleSubmit}>
        <label className="gate-label" htmlFor="gatePassword">
          Password
        </label>
        <input
          id="gatePassword"
          className="gate-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && (
          <p className="gate-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="gate-btn"
          type="submit"
          disabled={checking || !password}
        >
          {checking ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
