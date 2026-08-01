"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewWeddingPage() {
  const router = useRouter();
  const [clientNames, setClientNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_names: clientNames,
          event_date: eventDate,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      const body = await res.json();
      setError(body?.error ?? "Failed to create wedding");
    } catch (err) {
      console.error("[new-wedding] failed", err);
      setError("Unexpected error creating wedding");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="dash-main dash-narrow">
      <Link href="/dashboard" className="dash-back">
        ← Back to dashboard
      </Link>
      <h1 className="dash-title" style={{ marginBottom: 28 }}>
        New Wedding
      </h1>
      <form onSubmit={handleSubmit} className="dash-form">
        <label className="dash-field">
          <span>Client names</span>
          <input
            className="dash-input"
            type="text"
            required
            value={clientNames}
            onChange={(e) => setClientNames(e.target.value)}
          />
        </label>
        <label className="dash-field">
          <span>Event date</span>
          <input
            className="dash-input"
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </label>
        {error && <p className="dash-error">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn-dash"
          style={{ alignSelf: "flex-start" }}
        >
          {submitting ? "Creating…" : "Create Wedding"}
        </button>
      </form>
    </main>
  );
}
