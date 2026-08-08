"use client";

import { useState } from "react";
import type {
  DeliveryType,
  GalleryCategory,
  GalleryMedia,
  SelectionState,
} from "@/types/media";
import Lightbox from "./Lightbox";
import FavoriteButton from "./FavoriteButton";
import AlbumButton from "./AlbumButton";
import NoteInput from "./NoteInput";
import DeliveryChoice from "./DeliveryChoice";
import StudioLogo from "./StudioLogo";

export default function GalleryTabs({
  categories,
  clientNames,
  watermark,
  initialSelections,
  token,
  submitted,
}: {
  categories: GalleryCategory[];
  clientNames: string;
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
      selections[mediaId] ?? {
        favorited: false,
        inAlbum: false,
        clientNote: "",
        deliveryType: null,
      }
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
          delivery_type: patch.deliveryType,
        },
      }),
    });
    if (!res.ok) {
      console.error("[selections] save failed", await res.json());
    }
    return res.ok;
  }

  async function setDelivery(mediaId: string, type: DeliveryType) {
    if (isSubmitted) return;
    const prev = getSelection(mediaId).deliveryType;
    patchSelection(mediaId, { deliveryType: type });
    const ok = await savePatch(mediaId, { deliveryType: type });
    if (!ok) patchSelection(mediaId, { deliveryType: prev });
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

  const selectedPhotoIds = Object.keys(selections).filter((id) => {
    const sel = selections[id];
    return sel && (sel.favorited || sel.inAlbum);
  });

  const missingDelivery = selectedPhotoIds.filter(
    (id) => !getSelection(id).deliveryType
  );

  async function submitSelection() {
    if (submitting) return;

    if (missingDelivery.length > 0) {
      const first = missingDelivery[0];
      const category = categories.find((c) =>
        c.items.some((i) => i.id === first)
      );
      if (category && category.name !== active) {
        setActive(category.name);
      }
      setTimeout(() => {
        document
          .getElementById(`gallery-media-${first}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      return;
    }

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
    return (
      <div className="gallery-shell">
        <p className="gallery-empty">No media yet.</p>
      </div>
    );
  }

  const section = categories.find((c) => c.name === active) ?? categories[0];

  return (
    <>
      <header className="gallery-band">
        <div className="gallery-band-inner">
          <div>
            <StudioLogo onDark />
            <h1 className="gallery-names">{clientNames}</h1>
          </div>
          <div className="gallery-actions">
            {isSubmitted ? (
              <span className="badge-submitted">Selection submitted</span>
            ) : (
              <button
                onClick={submitSelection}
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? "Submitting…" : "Submit my selection"}
              </button>
            )}
          </div>
        </div>
      </header>

      {missingDelivery.length > 0 && !isSubmitted && (
        <div className="delivery-warning" role="alert">
          <strong>
            {missingDelivery.length} selected photo
            {missingDelivery.length > 1 ? "s" : ""} need
            {missingDelivery.length === 1 ? "s" : ""} a Print/Digital choice
          </strong>{" "}
          — pick Print or Digital for each highlighted photo before submitting.
        </div>
      )}

      <div className="gallery-shell">
        <nav
          className="gallery-tabs"
          role="tablist"
          aria-label="Gallery categories"
        >
          {categories.map((category) => (
            <button
              key={category.name}
              role="tab"
              aria-selected={active === category.name}
              className={"gallery-tab" + (active === category.name ? " is-active" : "")}
              onClick={() => setActive(category.name)}
            >
              {category.name}
              <span className="gallery-tab-count">{category.items.length}</span>
            </button>
          ))}
        </nav>

        <section aria-label={`${section.name} photos`}>
          <span className="gallery-section-title">{section.name}</span>
          <div className="gallery-grid">
            {section.items.map((item) => {
              const sel = getSelection(item.id);
              const isSelected = sel.favorited || sel.inAlbum;
              const needsDelivery =
                isSelected && missingDelivery.includes(item.id);
              return (
                <div
                  key={item.id}
                  id={`gallery-media-${item.id}`}
                  className={
                    "gallery-card" + (needsDelivery ? " needs-delivery" : "")
                  }
                >
                  <button
                    className="gallery-thumb"
                    onClick={() => setSelected(item)}
                    aria-label={`Open ${section.name} photo`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`${section.name} photo`}
                      loading="lazy"
                    />
                  </button>
                  {needsDelivery && (
                    <span className="needs-delivery-badge">Print/Digital needed</span>
                  )}
                  <FavoriteButton
                    favorited={sel.favorited}
                    onToggle={() => toggleFavorite(item.id)}
                    disabled={isSubmitted}
                  />
                  <AlbumButton
                    inAlbum={sel.inAlbum}
                    onToggle={() => toggleAlbum(item.id)}
                    position={{ top: 8, left: 8, right: undefined }}
                    disabled={isSubmitted}
                  />
                  {isSelected && (
                    <DeliveryChoice
                      value={sel.deliveryType}
                      onChange={(type) => setDelivery(item.id, type)}
                      disabled={isSubmitted}
                    />
                  )}
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
      </div>

      {selected && (
        <Lightbox
          item={selected}
          watermark={watermark}
          selection={getSelection(selected.id)}
          disabled={isSubmitted}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onToggleAlbum={() => toggleAlbum(selected.id)}
          onSaveNote={(note) => saveNote(selected.id, note)}
          onSetDelivery={(type) => setDelivery(selected.id, type)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
