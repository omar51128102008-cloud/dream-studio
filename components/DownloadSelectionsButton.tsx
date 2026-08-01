"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DownloadSelectionsButton({
  weddingId,
}: {
  weddingId: string;
}) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/selections`);

      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("[download-selections] failed", body);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wedding-${weddingId}-selections.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[download-selections] failed", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="btn-dash ghost"
    >
      {downloading ? "Downloading…" : "Download selections"}
    </button>
  );
}
