import "../../gallery.css";
import { createClient } from "@/lib/supabase/server";
import { getMediaUrl } from "@/lib/supabase/storage";
import GalleryEntry from "@/components/GalleryEntry";
import GalleryTabs from "@/components/GalleryTabs";
import type { GalleryCategory, SelectionState } from "@/types/media";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, client_names, status")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !wedding) {
    return (
      <main className="gallery-shell">
        <span className="gallery-eyebrow">Dream Studio</span>
        <h1 className="gallery-names">Gallery not found</h1>
        <p className="gallery-empty">
          We couldn&apos;t find a gallery for that link.
        </p>
      </main>
    );
  }

  const { data: media } = await supabase
    .from("media")
    .select("id, category, media_type, preview_path")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true });

  const mediaIds = (media ?? []).map((m) => m.id);

  const { data: selections } = await supabase
    .from("selections")
    .select("media_id, favorited, in_album, client_note")
    .in("media_id", mediaIds);

  const selectionByMedia: Record<string, SelectionState> = {};
  for (const item of media ?? []) {
    const sel = (selections ?? []).find((s) => s.media_id === item.id);
    selectionByMedia[item.id] = {
      favorited: sel?.favorited ?? false,
      inAlbum: sel?.in_album ?? false,
      clientNote: sel?.client_note ?? "",
    };
  }

  const byCategory = new Map<string, GalleryCategory>();
  for (const item of media ?? []) {
    const name = item.category ?? "Other";
    if (!byCategory.has(name)) {
      byCategory.set(name, { name, items: [] });
    }
    byCategory.get(name)!.items.push({
      id: item.id,
      mediaType: item.media_type,
      previewUrl: item.preview_path
        ? getMediaUrl(item.preview_path)
        : "",
    });
  }

  const categories = [...byCategory.values()];
  const clientNames = wedding.client_names ?? "Dream Studio";
  const heroPreview = categories[0]?.items[0]?.previewUrl ?? "";

  return (
    <GalleryEntry
      clientNames={clientNames}
      previewUrl={heroPreview}
      token={token}
    >
      <GalleryTabs
        categories={categories}
        clientNames={clientNames}
        watermark={clientNames}
        initialSelections={selectionByMedia}
        token={token}
        submitted={wedding.status === "submitted"}
      />
    </GalleryEntry>
  );
}
