export function getMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${path}`;
}
