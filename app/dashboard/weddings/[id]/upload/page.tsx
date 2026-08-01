import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";

export default async function UploadPage({
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
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 16px" }}>
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
    .select("id, client_names, studio_id")
    .eq("id", id)
    .maybeSingle();

  if (!staff || !wedding || wedding.studio_id !== staff.studio_id) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px" }}>
      <h1 style={{ marginBottom: 4 }}>Upload Media</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        {wedding.client_names ?? "Wedding"}
      </p>
      <UploadForm weddingId={id} />
    </main>
  );
}
