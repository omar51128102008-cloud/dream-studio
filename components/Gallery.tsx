"use client";

import { useState } from "react";
import { MarkIcon, ReticleIcon } from "@/components/icons";

const items = [
  { id: 1587042, cat: "weddings", h: "tall", name: "First Embrace" },
  { id: 19196476, cat: "portraits", h: "mid", name: "Quiet Portrait" },
  { id: 33714937, cat: "events", h: "short", name: "Golden Hour Coverage" },
  { id: 14408918, cat: "film", h: "mid", name: "Behind the Scenes" },
  { id: 9197343, cat: "weddings", h: "short", name: "Under the Arch" },
  { id: 34623497, cat: "portraits", h: "tall", name: "Studio Light" },
  { id: 3497181, cat: "events", h: "mid", name: "On the Street" },
  { id: 2388569, cat: "film", h: "short", name: "The Set" },
  { id: 31888305, cat: "weddings", h: "mid", name: "Together" },
  { id: 7886213, cat: "portraits", h: "short", name: "Natural Frame" },
];

const filters = [
  ["all", "All"],
  ["weddings", "Weddings"],
  ["portraits", "Portraits"],
  ["events", "Events"],
  ["film", "Film"],
];

export default function Gallery() {
  const [active, setActive] = useState("all");

  return (
    <section id="work" className="section-pad">
      <div className="container">
        <div className="gallery-head">
          <div>
            <div className="eyebrow reveal">
              <MarkIcon />
              PORTFOLIO
            </div>
            <h2 className="reveal">Selected Work</h2>
          </div>
          <div className="filters reveal">
            {filters.map(([value, label]) => (
              <button
                key={value}
                className={active === value ? "active" : ""}
                data-filter={value}
                onClick={() => setActive(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-gallery" id="galleryGrid">
          {items.map((it) => (
            <div
              key={it.id}
              className={`g-item h-${it.h}${
                active !== "all" && active !== it.cat ? " hide" : ""
              }`}
              data-cat={it.cat}
            >
              <img
                src={`https://images.pexels.com/photos/${it.id}/pexels-photo-${it.id}.jpeg?auto=compress&cs=tinysrgb&w=700`}
                alt={it.name}
                loading="lazy"
              />
              <div className="reticle">
                <ReticleIcon />
              </div>
              <div className="overlay">
                <span className="cat">{it.cat}</span>
                <span className="name">{it.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
