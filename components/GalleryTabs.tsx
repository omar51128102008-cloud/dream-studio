"use client";

import { useState } from "react";

const categories = ["Preparation", "Ceremony", "Reception", "Portraits", "Details"];

const placeholderMedia: Record<string, number> = {
  Preparation: 6,
  Ceremony: 12,
  Reception: 9,
  Portraits: 8,
  Details: 5,
};

export default function GalleryTabs() {
  const [active, setActive] = useState(categories[0]);

  return (
    <div>
      <div role="tablist" aria-label="Gallery categories">
        {categories.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={active === category}
            onClick={() => setActive(category)}
            style={{
              marginRight: 8,
              padding: "8px 16px",
              fontWeight: active === category ? 600 : 400,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <section aria-label={`${active} photos`}>
        <h2>{active}</h2>
        <p>Placeholder section — media coming soon.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: placeholderMedia[active] }, (_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "4 / 3",
                background: "#e5e4df",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8c8c86",
                fontSize: 12,
              }}
            >
              {active} {i + 1}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
