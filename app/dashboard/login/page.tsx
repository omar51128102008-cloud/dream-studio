"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("[login] sign-in error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("[login] signed in — redirecting to", next);
      router.push(next);
      router.refresh();
    } catch (err) {
      console.error("[login] unexpected error during sign-in:", err);
      setLoading(false);
      setError("Something went wrong signing you in. Please try again.");
    }
  }

  return (
    <main className="dash-login">
      <span className="dash-eyebrow">Dream Studio</span>
      <h1 className="dash-login-title">Staff sign in</h1>
      <form onSubmit={handleSubmit} className="dash-form">
        <label className="dash-field">
          <span>Email</span>
          <input
            className="dash-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="dash-field">
          <span>Password</span>
          <input
            className="dash-input"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="dash-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-dash"
          style={{ alignSelf: "flex-start", padding: "12px 28px" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
