import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMediaUrl } from "@/lib/supabase/storage";
import DownloadSelectionsButton from "@/components/DownloadSelectionsButton";
import MediaWorkspace from "@/components/MediaWorkspace";

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
    .select("id, category, media_type, preview_path")
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
      id: item.id,
      category,
      filename: `${category}-${String(index).padStart(2, "0")}`,
      favorited: sel?.favorited ?? false,
      inAlbum: sel?.in_album ?? false,
      clientNote: sel?.client_note ?? "",
      previewUrl: item.preview_path ? getMediaUrl(item.preview_path) : "",
    };
  });

  return (
    <main className="dash-main">
      <Link href="/dashboard/weddings" className="dash-back">
        ← Back to weddings
      </Link>

      <header className="dash-header">
        <div>
          <h1 className="dash-title">
            {wedding.client_names ?? "Unnamed wedding"}
          </h1>
          <p className="dash-sub">
            {wedding.event_date
              ? new Date(wedding.event_date).toLocaleDateString()
              : "No date"}
            {"  ·  "}
            <span
              className={
                "dash-status" +
                (wedding.status === "submitted"
                  ? " is-submitted"
                  : wedding.status === "in_progress" ||
                      wedding.status === "in-progress"
                    ? " is-in-progress"
                    : "")
              }
            >
              {wedding.status ?? "draft"}
            </span>
          </p>
        </div>
        <div className="dash-actions">
          <DownloadSelectionsButton weddingId={id} />
          <Link href={`/dashboard/weddings/${id}/upload`} className="btn-dash">
            Upload media
          </Link>
        </div>
      </header>

      <MediaWorkspace weddingId={id} initialRows={rows} />
    </main>
  );
}
