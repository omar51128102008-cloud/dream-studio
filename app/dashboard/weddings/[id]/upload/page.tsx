import Link from "next/link";
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
    .select("id, client_names, studio_id")
    .eq("id", id)
    .maybeSingle();

  if (!staff || !wedding || wedding.studio_id !== staff.studio_id) {
    notFound();
  }

  return (
    <main className="dash-main dash-narrow">
      <Link href={`/dashboard/weddings/${id}`} className="dash-back">
        ← Back to wedding
      </Link>
      <h1 className="dash-title">Upload Media</h1>
      <p className="dash-sub">{wedding.client_names ?? "Wedding"}</p>
      <UploadForm weddingId={id} />
    </main>
  );
}
