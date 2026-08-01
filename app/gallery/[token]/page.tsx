import { createClient } from "@/lib/supabase/server";
import GalleryTabs from "@/components/GalleryTabs";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weddings")
    .select("client_names")
    .eq("access_token", token)
    .maybeSingle();

  console.log("Supabase query:", { token, data, error });

  if (error || !data) {
    return (
      <main>
        <h1>Gallery not found</h1>
        <p>We couldn&apos;t find a gallery for that link.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{data.client_names}</h1>
      <GalleryTabs />
    </main>
  );
}
