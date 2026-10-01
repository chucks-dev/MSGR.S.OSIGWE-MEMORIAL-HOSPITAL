"use client";

import { useState } from "react";
import { Photo, EmptyState } from "./Bits";
import { Icon, serviceIcon } from "./Icons";
import { ToggleButton, DeleteButton } from "./AdminActions";
import ServiceFormModal from "./ServiceFormModal";

export default function ServicesAdmin({ services }) {
  const [modal, setModal] = useState(null);

  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Services</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal("new")}>Add Service</button>
      </div>

      {services.length === 0 ? (
        <EmptyState title="No services yet">Add your first service.</EmptyState>
      ) : (
        <div className="grid cols-3">
          {services.map((sv) => (
            <article className="card" key={sv.id}>
              {sv.imageUrl ? <Photo src={sv.imageUrl} alt={sv.name} className="card-img" /> : null}
              <div className="card-body">
                {!sv.imageUrl && <div className="icon-tile"><Icon name={serviceIcon(sv.name)} /></div>}
                <h3>{sv.name}</h3>
                <p>{sv.summary}</p>
                {!sv.isActive && <span className="badge gray" style={{ alignSelf: "flex-start" }}>Inactive</span>}
                <div className="card-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setModal(sv)}>Edit</button>
                  <ToggleButton
                    url={`/api/admin/services/${sv.id}`}
                    field="isActive"
                    value={sv.isActive}
                    onLabel="Deactivate"
                    offLabel="Activate"
                  />
                  <DeleteButton url={`/api/admin/services/${sv.id}`} confirmText={`Delete ${sv.name}? This cannot be undone.`} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && <ServiceFormModal service={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </>
  );
}
