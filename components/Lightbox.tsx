"use client";

import { useEffect } from "react";
import type { GalleryMedia, SelectionState } from "@/types/media";
import Watermark from "./Watermark";
import FavoriteButton from "./FavoriteButton";
import AlbumButton from "./AlbumButton";
import NoteInput from "./NoteInput";

export default function Lightbox({
  item,
  watermark,
  selection,
  disabled,
  onToggleFavorite,
  onToggleAlbum,
  onSaveNote,
  onClose,
}: {
  item: GalleryMedia;
  watermark: string;
  selection: SelectionState;
  disabled: boolean;
  onToggleFavorite: () => void;
  onToggleAlbum: () => void;
  onSaveNote: (note: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className="lightbox-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="lightbox-img"
          src={item.previewUrl}
          alt="Fullscreen preview"
        />
        <Watermark text={watermark} />
        <FavoriteButton
          favorited={selection.favorited}
          onToggle={onToggleFavorite}
          position={{ bottom: 8, right: 8, top: "auto" }}
          disabled={disabled}
        />
        <AlbumButton
          inAlbum={selection.inAlbum}
          onToggle={onToggleAlbum}
          position={{ bottom: 8, left: 8, top: "auto" }}
          disabled={disabled}
        />
        <NoteInput
          value={selection.clientNote}
          onSave={onSaveNote}
          position={{ top: 8, left: 8, right: 60, bottom: "auto" }}
          disabled={disabled}
        />
      </div>
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
