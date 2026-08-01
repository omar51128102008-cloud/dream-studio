import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WeddingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
        <h1>Please sign in</h1>
      </main>
    );
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("studio_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
        <h1>No studio linked to this account</h1>
      </main>
    );
  }

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, client_names, event_date, status")
    .eq("studio_id", staff.studio_id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Weddings</h1>
        <Link
          href="/dashboard/weddings/new"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 4,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + New Wedding
        </Link>
      </div>

      {weddings && weddings.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {weddings.map((w) => (
            <li
              key={w.id}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                overflow: "hidden",
              }}
            >
              <Link
                href={`/dashboard/weddings/${w.id}/upload`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  textDecoration: "none",
                  color: "#111",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {w.client_names ?? "Unnamed wedding"}
                  </div>
                  <div style={{ color: "#666", fontSize: 14 }}>
                    {w.event_date ? new Date(w.event_date).toLocaleDateString() : "No date"}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background:
                      w.status === "submitted"
                        ? "rgba(46,125,50,0.15)"
                        : "rgba(0,0,0,0.06)",
                    color:
                      w.status === "submitted"
                        ? "#2e7d32"
                        : "#333",
                  }}
                >
                  {w.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#666" }}>
          No weddings yet.{" "}
          <Link href="/dashboard/weddings/new">Create your first wedding</Link>.
        </p>
      )}
    </main>
  );
}
