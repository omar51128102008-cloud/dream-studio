"use client";

import { useEffect } from "react";
import type { GalleryMedia } from "@/types/media";
import Watermark from "./Watermark";
import FavoriteButton from "./FavoriteButton";

export default function Lightbox({
  item,
  watermark,
  favorited,
  onToggleFavorite,
  onClose,
}: {
  item: GalleryMedia;
  watermark: string;
  favorited: boolean;
  onToggleFavorite: () => void;
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
          favorited={favorited}
          onToggle={onToggleFavorite}
          position={{ bottom: 8, top: undefined, right: 8 }}
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
