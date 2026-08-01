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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 16px" }}>
      <p>
        <Link href="/dashboard">&larr; Back to dashboard</Link>
      </p>
      <h1 style={{ marginBottom: 24 }}>New Wedding</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Client names
          <input
            type="text"
            required
            value={clientNames}
            onChange={(e) => setClientNames(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Event date
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
          />
        </label>
        {error && <p style={{ color: "#b00020", margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 16px",
            borderRadius: 4,
            border: "none",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Creating..." : "Create Wedding"}
        </button>
      </form>
    </main>
  );
}
