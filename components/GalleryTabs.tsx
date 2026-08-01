"use client";

import { useState } from "react";
import type { GalleryCategory, GalleryMedia } from "@/types/media";
import Lightbox from "./Lightbox";

export default function GalleryTabs({
  categories,
  watermark,
}: {
  categories: GalleryCategory[];
  watermark: string;
}) {
  const [active, setActive] = useState(categories[0]?.name ?? "");
  const [selected, setSelected] = useState<GalleryMedia | null>(null);

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
            <button
              key={item.id}
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
          ))}
        </div>
      </section>

      {selected && (
        <Lightbox
          item={selected}
          watermark={watermark}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
