"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const CATEGORIES = ["All", "Hospital", "Medical Team", "Facilities", "Community Outreach", "Events"];

export default function GalleryGrid({ images }) {
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);

  const filtered = category === "All" ? images : images.filter((i) => i.category === category);

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => Math.min(filtered.length - 1, i + 1));
      if (e.key === "ArrowLeft") setActive((i) => Math.max(0, i - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, filtered.length]);

  return (
    <>
      <div className="chips" role="group" aria-label="Filter gallery">
        {CATEGORIES.map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No images in this category yet.</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="gallery-item"
              onClick={() => setActive(i)}
              aria-label={`View larger image: ${img.caption}`}
            >
              <img src={img.imageUrl} alt={img.caption} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {active !== null && filtered[active] && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={filtered[active].caption} onClick={(e) => e.target === e.currentTarget && setActive(null)}>
          <button ref={closeRef} type="button" className="btn btn-light close" onClick={() => setActive(null)} aria-label="Close">
            <Icon name="close" />
          </button>
          <figure>
            <img src={filtered[active].imageUrl} alt={filtered[active].caption} />
            <figcaption>{filtered[active].caption}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
