"use client";

import { useState } from "react";
import type { GalleryCategory, GalleryMedia } from "@/types/media";
import Lightbox from "./Lightbox";
import FavoriteButton from "./FavoriteButton";

export default function GalleryTabs({
  categories,
  watermark,
  favoritedIds,
}: {
  categories: GalleryCategory[];
  watermark: string;
  favoritedIds: string[];
}) {
  const [active, setActive] = useState(categories[0]?.name ?? "");
  const [selected, setSelected] = useState<GalleryMedia | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(favoritedIds)
  );

  async function toggleFavorite(mediaId: string) {
    const next = !favorites.has(mediaId);
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (next) {
        updated.add(mediaId);
      } else {
        updated.delete(mediaId);
      }
      return updated;
    });

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      if (!res.ok) {
        setFavorites((prev) => {
          const updated = new Set(prev);
          if (next) {
            updated.delete(mediaId);
          } else {
            updated.add(mediaId);
          }
          return updated;
        });
      }
    } catch {
      setFavorites((prev) => {
        const updated = new Set(prev);
        if (next) {
          updated.delete(mediaId);
        } else {
          updated.add(mediaId);
        }
        return updated;
      });
    }
  }

  if (categories.length === 0) {
    return <p>No media yet.</p>;
  }

  const section = categories.find((c) => c.name === active) ?? categories[0];

  return (
    <div>
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

      <section aria-label={`${section.name} photos`}>
        <h2>{section.name}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {section.items.map((item) => (
            <div
              key={item.id}
              style={{ position: "relative" }}
            >
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
                favorited={favorites.has(item.id)}
                onToggle={() => toggleFavorite(item.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <Lightbox
          item={selected}
          watermark={watermark}
          favorited={favorites.has(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
