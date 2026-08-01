import { createClient } from "@/lib/supabase/server";
import { getMediaUrl } from "@/lib/supabase/storage";
import GalleryTabs from "@/components/GalleryTabs";
import type { GalleryCategory } from "@/types/media";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id, client_names")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !wedding) {
    return (
      <main>
        <h1>Gallery not found</h1>
        <p>We couldn&apos;t find a gallery for that link.</p>
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
    .select("media_id, favorited")
    .in("media_id", mediaIds);

  const favoritedIds = (selections ?? [])
    .filter((s) => s.favorited)
    .map((s) => s.media_id);

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

  return (
    <main>
      <h1>{wedding.client_names}</h1>
      <GalleryTabs
        categories={categories}
        watermark={wedding.client_names ?? "Dream Studio"}
        favoritedIds={favoritedIds}
      />
    </main>
  );
}
