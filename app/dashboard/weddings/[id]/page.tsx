import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DownloadSelectionsButton from "@/components/DownloadSelectionsButton";

export const dynamic = "force-dynamic";

export default async function WeddingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, client_names, event_date, status, studio_id")
    .eq("id", id)
    .maybeSingle();

  if (!staff || !wedding || wedding.studio_id !== staff.studio_id) {
    notFound();
  }

  const { data: media } = await supabase
    .from("media")
    .select("id, category, media_type")
    .eq("wedding_id", id)
    .order("created_at", { ascending: true });

  const mediaIds = (media ?? []).map((m) => m.id);

  const { data: selections } = await supabase
    .from("selections")
    .select("media_id, favorited, in_album, client_note")
    .in("media_id", mediaIds);

  const selectionByMedia = new Map(
    (selections ?? []).map((s) => [s.media_id, s])
  );

  const counters = new Map<string, number>();
  const rows = (media ?? []).map((item) => {
    const category = item.category ?? "Other";
    const index = (counters.get(category) ?? 0) + 1;
    counters.set(category, index);
    const sel = selectionByMedia.get(item.id);
    return {
      ...item,
      category,
      filename: `${category}-${String(index).padStart(2, "0")}`,
      favorited: sel?.favorited ?? false,
      inAlbum: sel?.in_album ?? false,
      clientNote: sel?.client_note ?? "",
    };
  });

  const favoritedCount = rows.filter((r) => r.favorited).length;
  const inAlbumCount = rows.filter((r) => r.inAlbum).length;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
      <p>
        <Link href="/dashboard/weddings">&larr; Back to weddings</Link>
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h1 style={{ margin: 0 }}>
          {wedding.client_names ?? "Unnamed wedding"}
        </h1>
        <DownloadSelectionsButton weddingId={id} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 24,
          color: "#666",
        }}
      >
        <span>
          {wedding.event_date
            ? new Date(wedding.event_date).toLocaleDateString()
            : "No date"}
        </span>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "capitalize",
            background:
              wedding.status === "submitted"
                ? "rgba(46,125,50,0.15)"
                : "rgba(0,0,0,0.06)",
            color: wedding.status === "submitted" ? "#2e7d32" : "#333",
          }}
        >
          {wedding.status}
        </span>
      </div>

      <p style={{ color: "#666", marginTop: 0 }}>
        <Link href={`/dashboard/weddings/${id}/upload`}>Upload media</Link>
      </p>

      <h2 style={{ marginBottom: 8 }}>
        Media{" "}
        <span style={{ fontWeight: 400, color: "#666", fontSize: 16 }}>
          ({rows.length}) &middot; {favoritedCount} favorited &middot;{" "}
          {inAlbumCount} in album
        </span>
      </h2>

      {rows.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", color: "#666" }}>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #ddd" }}>
                Filename
              </th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #ddd" }}>
                Category
              </th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #ddd" }}>
                Favorited
              </th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #ddd" }}>
                In Album
              </th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #ddd" }}>
                Client Note
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {row.filename}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {row.category}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {row.favorited ? "Yes" : "No"}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {row.inAlbum ? "Yes" : "No"}
                </td>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {row.clientNote || <span style={{ color: "#bbb" }}>&mdash;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#666" }}>
          No media yet.{" "}
          <Link href={`/dashboard/weddings/${id}/upload`}>Upload the first images</Link>.
        </p>
      )}
    </main>
  );
}
