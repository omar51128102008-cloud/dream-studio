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
    <form onSubmit={handleSubmit} className="dash-form dash-form-mt">
      <label className="dash-field">
        <span>Category</span>
        <select
          className="dash-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="dash-field">
        <span>Images (multiple allowed)</span>
        <input
          className="dash-input"
          type="file"
          accept="image/*"
          multiple
          required
          onChange={(e) => setFiles(e.target.files)}
        />
      </label>

      {error && <p className="dash-error">{error}</p>}
      {message && <p className="dash-success">{message}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="btn-dash"
        style={{ alignSelf: "flex-start" }}
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
