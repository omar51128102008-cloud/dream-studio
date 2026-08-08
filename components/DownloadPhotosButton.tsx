"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DeliveryType } from "@/types/media";

export type DownloadablePhoto = {
  id: string;
  category: string;
  filename: string;
  deliveryType: DeliveryType | null;
  previewUrl: string;
};

export default function DownloadPhotosButton({
  weddingId,
  photos,
}: {
  weddingId: string;
  photos: DownloadablePhoto[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkedIds = photos
    .filter((p) => checked[p.id])
    .map((p) => p.id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !downloading) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, downloading]);

  function openModal() {
    setChecked(Object.fromEntries(photos.map((p) => [p.id, true])));
    setError(null);
    setOpen(true);
  }

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleDownload() {
    if (checkedIds.length === 0) {
      setError("Select at least one photo to include.");
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: checkedIds }),
      });

      if (res.status === 401) {
        router.push("/dashboard/login");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Download failed.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wedding-${weddingId}-selected-photos.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error("[download-photos] failed", err);
      setError("Unexpected error preparing the ZIP.");
    } finally {
      setDownloading(false);
    }
  }

  if (photos.length === 0) return null;

  return (
    <>
      <button className="btn-dash ghost" onClick={openModal}>
        Download selected photos
      </button>

      {open && (
        <div
          className="dash-modal"
          onClick={() => !downloading && setOpen(false)}
        >
          <div
            className="dash-modal-box is-download"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-photos-title"
          >
            <h3 className="dash-modal-title" id="download-photos-title">
              Download selected photos
            </h3>
            <p className="dash-modal-text">
              {photos.length} photo{photos.length === 1 ? "" : "s"} selected by
              the client. Uncheck any you want to leave out.
            </p>

            <ul className="download-list">
              {photos.map((p) => (
                <li key={p.id}>
                  <label className="download-item">
                    <input
                      type="checkbox"
                      checked={!!checked[p.id]}
                      onChange={() => toggle(p.id)}
                      disabled={downloading}
                    />
                    <img src={p.previewUrl} alt="" loading="lazy" />
                    <span className="download-meta">
                      <span className="download-name">{p.filename}</span>
                      <span
                        className={
                          "download-delivery" +
                          (p.deliveryType === null ? " is-missing" : "")
                        }
                      >
                        {p.deliveryType === "print"
                          ? "Print"
                          : p.deliveryType === "digital"
                            ? "Digital"
                            : "No choice"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {error && <p className="dash-error">{error}</p>}

            <div className="dash-actions justify-end">
              <button
                className="btn-dash ghost"
                onClick={() => setOpen(false)}
                disabled={downloading}
              >
                Cancel
              </button>
              <button
                className="btn-dash"
                onClick={handleDownload}
                disabled={downloading || checkedIds.length === 0}
              >
                {downloading
                  ? "Preparing ZIP…"
                  : `Download ZIP (${checkedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
