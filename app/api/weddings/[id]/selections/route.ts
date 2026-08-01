import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("studio_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!staff) {
    return NextResponse.json(
      { error: "No studio linked to this account" },
      { status: 403 }
    );
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, studio_id")
    .eq("id", id)
    .maybeSingle();

  if (!wedding) {
    return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
  }

  if (wedding.studio_id !== staff.studio_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: media } = await supabase
    .from("media")
    .select("id, category")
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

  const rows: string[] = ["filename,favorited,in_album,client_note"];

  const counters = new Map<string, number>();
  for (const item of media ?? []) {
    const category = item.category ?? "Other";
    const index = (counters.get(category) ?? 0) + 1;
    counters.set(category, index);

    const sel = selectionByMedia.get(item.id);
    const filename = `${category}-${String(index).padStart(2, "0")}`;
    rows.push(
      [
        csvEscape(filename),
        sel?.favorited ? "true" : "false",
        sel?.in_album ? "true" : "false",
        csvEscape(sel?.client_note ?? ""),
      ].join(",")
    );
  }

  const csv = rows.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedding-${id}-selections.csv"`,
    },
  });
}
