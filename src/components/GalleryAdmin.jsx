"use client";

import { useState } from "react";
import { EmptyState } from "./Bits";
import { DeleteButton } from "./AdminActions";
import GalleryFormModal from "./GalleryFormModal";

export default function GalleryAdmin({ images }) {
  const [modal, setModal] = useState(false);

  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Gallery</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>Upload Photo</button>
      </div>

      {images.length === 0 ? (
        <EmptyState title="No photos yet">Upload your first photo.</EmptyState>
      ) : (
        <div className="gallery-grid">
          {images.map((img) => (
            <div className="gallery-item" key={img.id} style={{ cursor: "default", position: "relative" }}>
              <img src={img.imageUrl} alt={img.caption} loading="lazy" />
              <div style={{ position: "absolute", inset: "auto 0 0 0", background: "rgba(10,29,53,0.75)", color: "#fff", padding: "0.4rem 0.5rem", fontSize: "0.82rem" }}>
                {img.caption}
                <div style={{ marginTop: "0.3rem" }}>
                  <DeleteButton url={`/api/admin/gallery/${img.id}`} label="Delete" confirmText="Delete this photo?" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <GalleryFormModal onClose={() => setModal(false)} />}
    </>
  );
}
