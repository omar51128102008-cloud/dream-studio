"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Preparation",
  "Ceremony",
  "Reception",
  "Portraits",
  "Details",
  "Other",
];

export default function UploadForm({ weddingId }: { weddingId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Select at least one image file.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("category", category);
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    try {
      const res = await fetch(`/api/weddings/${weddingId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      const body = await res.json();

      if (!res.ok) {
        setError(body?.error ?? "Upload failed.");
        return;
      }

      const count = body.uploaded?.length ?? 0;
      const failed = body.errors?.length ?? 0;
      setMessage(`Uploaded ${count} file(s).${failed ? ` ${failed} failed.` : ""}`);
      setFiles(null);
      router.refresh();
    } catch (err) {
      console.error("[upload] failed", err);
      setError("Unexpected upload error.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        Images (multiple allowed)
        <input
          type="file"
          accept="image/*"
          multiple
          required
          onChange={(e) => setFiles(e.target.files)}
          style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
        />
      </label>

      {error && <p style={{ color: "#b00020", margin: 0 }}>{error}</p>}
      {message && <p style={{ color: "#2e7d32", margin: 0 }}>{message}</p>}

      <button
        type="submit"
        disabled={uploading}
        style={{
          padding: "10px 16px",
          borderRadius: 4,
          border: "none",
          background: "#111",
          color: "#fff",
          fontWeight: 600,
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
