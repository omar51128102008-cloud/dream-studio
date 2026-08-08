"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type MediaRow = {
  id: string;
  category: string;
  filename: string;
  favorited: boolean;
  inAlbum: boolean;
  clientNote: string;
  previewUrl: string;
};

type Message = { type: "success" | "error"; text: string };

export default function MediaWorkspace({
  weddingId,
  initialRows,
}: {
  weddingId: string;
  initialRows: MediaRow[];
}) {
  const [view, setView] = useState<"table" | "gallery">("table");
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [lightbox, setLightbox] = useState<MediaRow | null>(null);

  const favoritedCount = rows.filter((r) => r.favorited).length;
  const inAlbumCount = rows.filter((r) => r.inAlbum).length;

  const categories = useMemo(() => {
    const byCategory = new Map<string, MediaRow[]>();
    for (const row of rows) {
      const list = byCategory.get(row.category) ?? [];
      list.push(row);
      byCategory.set(row.category, list);
    }
    return [...byCategory.entries()].map(([name, items]) => ({
      name,
      items,
    }));
  }, [rows]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  async function handleDelete(row: MediaRow) {
    const confirmed = window.confirm(
      `Delete "${row.filename}"? Are you sure? This can't be undone.`
    );
    if (!confirmed) return;

    setBusyId(row.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/media/${row.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage({
          type: "error",
          text: body?.error ?? "Failed to delete photo.",
        });
        return;
      }

      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setLightbox((prev) => (prev?.id === row.id ? null : prev));
      const warningCount = body?.warnings?.length ?? 0;
      setMessage({
        type: "success",
        text:
          `Deleted "${row.filename}".` +
          (warningCount > 0
            ? ` ${warningCount} storage cleanup warning${warningCount > 1 ? "s" : ""}.`
            : ""),
      });
    } catch (err) {
      console.error("[media-delete] failed", err);
      setMessage({ type: "error", text: "Unexpected error deleting photo." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="dash-media">
      <div className="dash-media-head">
        <h2 className="dash-table-title">
          Media{" "}
          <span className="dash-summary">
            ({rows.length}) · {favoritedCount} favorited · {inAlbumCount} in
            album
          </span>
        </h2>
        <div className="dash-view-toggle" role="tablist" aria-label="Media view">
          <button
            role="tab"
            aria-selected={view === "table"}
            className={view === "table" ? "is-active" : ""}
            onClick={() => setView("table")}
          >
            Table
          </button>
          <button
            role="tab"
            aria-selected={view === "gallery"}
            className={view === "gallery" ? "is-active" : ""}
            onClick={() => setView("gallery")}
          >
            Gallery
          </button>
        </div>
      </div>

      {message && (
        <p className={"dash-message " + message.type} role="status">
          {message.text}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="dash-empty-state">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7a2 2 0 0 1 2-2h2.5l1.6 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            <circle cx="12" cy="12.5" r="3.2" />
          </svg>
          <p className="dash-empty-title">No media yet</p>
          <p className="dash-empty">Upload the first images to get started.</p>
          <Link
            href={`/dashboard/weddings/${weddingId}/upload`}
            className="btn-dash"
          >
            Upload media
          </Link>
        </div>
      ) : view === "table" ? (
        <div className="dash-table-scroll">
          <table className="dash-table dash-table--striped">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Category</th>
              <th>Favorited</th>
              <th>In album</th>
              <th>Client note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="dash-row-name">{row.filename}</td>
                <td className="dash-row-meta">{row.category}</td>
                <td className="dash-row-meta">{row.favorited ? "Yes" : "—"}</td>
                <td className="dash-row-meta">{row.inAlbum ? "Yes" : "—"}</td>
                <td className="dash-row-meta">
                  {row.clientNote || <span className="dash-note-dash">—</span>}
                </td>
                <td>
                  <div className="dash-actions justify-end">
                    <button
                      className="btn-dash ghost sm"
                      onClick={() => handleDelete(row)}
                      disabled={busyId === row.id}
                      aria-label={`Delete ${row.filename}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                      {busyId === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      ) : (
        <div className="dash-gallery">
          {categories.map((category) => (
            <section
              key={category.name}
              className="dash-gallery-section"
              aria-label={`${category.name} photos`}
            >
              <h3 className="dash-gallery-category">
                {category.name}
                <span className="dash-summary">{category.items.length}</span>
              </h3>
              <div className="dash-gallery-grid">
                {category.items.map((row) => (
                  <div className="dash-gallery-card" key={row.id}>
                    <button
                      className="dash-gallery-thumb"
                      onClick={() => setLightbox(row)}
                      aria-label={`Open ${row.filename}`}
                    >
                      {row.previewUrl ? (
                        <img
                          src={row.previewUrl}
                          alt={row.filename}
                          loading="lazy"
                        />
                      ) : (
                        <span className="dash-gallery-thumb-empty">No preview</span>
                      )}
                      <span className="dash-badges" aria-hidden="true">
                        {row.favorited && (
                          <span className="dash-badge dash-badge--fav">
                            <svg viewBox="0 0 24 24" width="10" height="10">
                              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                            Fav
                          </span>
                        )}
                        {row.inAlbum && (
                          <span className="dash-badge dash-badge--album">
                            <svg viewBox="0 0 24 24" width="10" height="10">
                              <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-3.8L6 21V4z" />
                            </svg>
                            Album
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      className="dash-thumb-delete"
                      onClick={() => handleDelete(row)}
                      disabled={busyId === row.id}
                      aria-label={`Delete ${row.filename}`}
                    >
                      <svg viewBox="0 0 24 24" width="11" height="11">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                      {busyId === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="dash-lightbox" onClick={() => setLightbox(null)}>
          <div
            className="dash-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.previewUrl ? (
              <img src={lightbox.previewUrl} alt={lightbox.filename} />
            ) : (
              <div className="dash-lightbox-empty">No preview available</div>
            )}
            <div className="dash-lightbox-bar">
              <div className="dash-lightbox-info">
                <p className="dash-lightbox-name">{lightbox.filename}</p>
                <p className="dash-lightbox-meta">{lightbox.category}</p>
                <div className="dash-lightbox-note">
                  <span className="dash-lightbox-note-label">Client note</span>
                  {lightbox.clientNote || "—"}
                </div>
              </div>
              <div className="dash-lightbox-actions">
                <button
                  className="btn-dash on-dark sm"
                  onClick={() => handleDelete(lightbox)}
                  disabled={busyId === lightbox.id}
                >
                  <svg viewBox="0 0 24 24" width="11" height="11">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                  {busyId === lightbox.id ? "Deleting…" : "Delete"}
                </button>
                <button
                  className="btn-dash on-dark sm"
                  onClick={() => setLightbox(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
