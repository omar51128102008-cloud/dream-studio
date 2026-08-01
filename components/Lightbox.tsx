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
  onToggleFavorite,
  onToggleAlbum,
  onSaveNote,
  onClose,
}: {
  item: GalleryMedia;
  watermark: string;
  selection: SelectionState;
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
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        cursor: "zoom-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: "100%", maxHeight: "100%" }}
      >
        <img
          src={item.previewUrl}
          alt={`Fullscreen preview`}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100vh",
            borderRadius: 4,
          }}
        />
        <Watermark text={watermark} />
        <FavoriteButton
          favorited={selection.favorited}
          onToggle={onToggleFavorite}
          position={{ bottom: 8, top: undefined, right: 8 }}
        />
        <AlbumButton
          inAlbum={selection.inAlbum}
          onToggle={onToggleAlbum}
          position={{ bottom: 8, top: undefined, left: 8 }}
        />
        <NoteInput
          value={selection.clientNote}
          onSave={onSaveNote}
          position={{ top: 8, bottom: undefined, left: 8, right: 60 }}
        />
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 32,
          lineHeight: 1,
          cursor: "pointer",
          zIndex: 1,
        }}
      >
        &times;
      </button>
    </div>
  );
}
