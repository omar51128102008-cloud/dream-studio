import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function statusClass(status: string | null | undefined): string {
  if (status === "submitted") return " is-submitted";
  if (status === "in_progress" || status === "in-progress") return " is-in-progress";
  return "";
}

export default async function WeddingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="dash-main">
        <h1 className="dash-title">Please sign in</h1>
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
      <main className="dash-main">
        <h1 className="dash-title">No studio linked to this account</h1>
      </main>
    );
  }

  const { data: weddings } = await supabase
    .from("weddings")
    .select("id, client_names, event_date, status")
    .eq("studio_id", staff.studio_id)
    .order("created_at", { ascending: false });

  return (
    <>
      <header className="dash-band">
        <div className="dash-band-inner">
          <div>
            <h1 className="dash-title">Weddings</h1>
            <p className="dash-sub">All client galleries for this studio</p>
          </div>
          <div className="dash-actions">
            <Link href="/dashboard/weddings/new" className="btn-dash on-dark">
              + New Wedding
            </Link>
          </div>
        </div>
      </header>

      <main className="dash-main">
        {weddings && weddings.length > 0 ? (
          <div className="dash-table-scroll">
            <table className="dash-table">
              <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {weddings.map((w) => (
                <tr key={w.id}>
                  <td className="dash-row-name">
                    {w.client_names ?? "Unnamed wedding"}
                  </td>
                  <td className="dash-row-meta">
                    {w.event_date
                      ? new Date(w.event_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span className={"dash-status" + statusClass(w.status)}>
                      {w.status ?? "draft"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-actions justify-end">
                      <Link
                        href={`/dashboard/weddings/${w.id}`}
                        className="btn-dash ghost sm"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/dashboard/weddings/${w.id}/upload`}
                        className="btn-dash ghost sm"
                      >
                        Upload
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="dash-empty-state">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7a2 2 0 0 1 2-2h2.5l1.6 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              <circle cx="12" cy="12.5" r="3.2" />
            </svg>
            <p className="dash-empty-title">No weddings yet</p>
            <p className="dash-empty">
              Create your first wedding to get started.
            </p>
            <Link href="/dashboard/weddings/new" className="btn-dash">
              Create your first wedding
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
