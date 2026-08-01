"use client";

import { useState } from "react";
import type { GalleryCategory, GalleryMedia, SelectionState } from "@/types/media";
import Lightbox from "./Lightbox";
import FavoriteButton from "./FavoriteButton";
import AlbumButton from "./AlbumButton";
import NoteInput from "./NoteInput";

export default function GalleryTabs({
  categories,
  watermark,
  initialSelections,
  token,
  submitted,
}: {
  categories: GalleryCategory[];
  watermark: string;
  initialSelections: Record<string, SelectionState>;
  token: string;
  submitted: boolean;
}) {
  const [active, setActive] = useState(categories[0]?.name ?? "");
  const [selected, setSelected] = useState<GalleryMedia | null>(null);
  const [selections, setSelections] = useState(initialSelections);
  const [isSubmitted, setIsSubmitted] = useState(submitted);
  const [submitting, setSubmitting] = useState(false);

  function getSelection(mediaId: string): SelectionState {
    return (
      selections[mediaId] ?? { favorited: false, inAlbum: false, clientNote: "" }
    );
  }

  function patchSelection(
    mediaId: string,
    patch: Partial<SelectionState>
  ) {
    setSelections((prev) => ({
      ...prev,
      [mediaId]: { ...getSelection(mediaId), ...patch },
    }));
  }

  async function savePatch(mediaId: string, patch: Partial<SelectionState>) {
    const res = await fetch("/api/selections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId,
        patch: {
          favorited: patch.favorited,
          in_album: patch.inAlbum,
          client_note: patch.clientNote,
        },
      }),
    });
    if (!res.ok) {
      console.error("[selections] save failed", await res.json());
    }
    return res.ok;
  }

  async function toggleFavorite(mediaId: string) {
    if (isSubmitted) return;
    const prev = getSelection(mediaId).favorited;
    patchSelection(mediaId, { favorited: !prev });
    const ok = await savePatch(mediaId, { favorited: !prev });
    if (!ok) patchSelection(mediaId, { favorited: prev });
  }

  async function toggleAlbum(mediaId: string) {
    if (isSubmitted) return;
    const prev = getSelection(mediaId).inAlbum;
    patchSelection(mediaId, { inAlbum: !prev });
    const ok = await savePatch(mediaId, { inAlbum: !prev });
    if (!ok) patchSelection(mediaId, { inAlbum: prev });
  }

  async function saveNote(mediaId: string, note: string) {
    if (isSubmitted) return;
    const ok = await savePatch(mediaId, { clientNote: note });
    if (!ok) patchSelection(mediaId, { clientNote: getSelection(mediaId).clientNote });
  }

  async function submitSelection() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        console.error("[submit] failed", await res.json());
      }
    } catch (err) {
      console.error("[submit] failed", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (categories.length === 0) {
    return <p>No media yet.</p>;
  }

  const section = categories.find((c) => c.name === active) ?? categories[0];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div role="tablist" aria-label="Gallery categories">
          {categories.map((category) => (
            <button
              key={category.name}
              role="tab"
              aria-selected={active === category.name}
              onClick={() => setActive(category.name)}
              style={{
                marginRight: 8,
                padding: "8px 16px",
                fontWeight: active === category.name ? 600 : 400,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        {isSubmitted ? (
          <span
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              background: "rgba(46,125,50,0.15)",
              color: "#2e7d32",
              fontWeight: 600,
            }}
          >
            Submitted
          </span>
        ) : (
          <button
            onClick={submitSelection}
            disabled={submitting}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Submitting..." : "Submit My Selection"}
          </button>
        )}
      </div>

      <section aria-label={`${section.name} photos`}>
        <h2>{section.name}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {section.items.map((item) => {
            const sel = getSelection(item.id);
            return (
              <div key={item.id} style={{ position: "relative" }}>
                <button
                  onClick={() => setSelected(item)}
                  aria-label={`Open ${section.name} photo`}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "none",
                    cursor: "zoom-in",
                  }}
                >
                  <img
                    src={item.previewUrl}
                    alt={`${section.name} photo`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </button>
                <FavoriteButton
                  favorited={sel.favorited}
                  onToggle={() => toggleFavorite(item.id)}
                  disabled={isSubmitted}
                />
                <AlbumButton
                  inAlbum={sel.inAlbum}
                  onToggle={() => toggleAlbum(item.id)}
                  position={{ left: 8, right: undefined }}
                  disabled={isSubmitted}
                />
                <NoteInput
                  value={sel.clientNote}
                  onSave={(note) => saveNote(item.id, note)}
                  disabled={isSubmitted}
                />
              </div>
            );
          })}
        </div>
      </section>

      {selected && (
        <Lightbox
          item={selected}
          watermark={watermark}
          selection={getSelection(selected.id)}
          disabled={isSubmitted}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onToggleAlbum={() => toggleAlbum(selected.id)}
          onSaveNote={(note) => saveNote(selected.id, note)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
