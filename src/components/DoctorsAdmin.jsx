"use client";

import { useState } from "react";
import { Photo, EmptyState } from "./Bits";
import { ToggleButton, DeleteButton } from "./AdminActions";
import DoctorFormModal from "./DoctorFormModal";

export default function DoctorsAdmin({ doctors }) {
  const [modal, setModal] = useState(null); // null | "new" | doctor object

  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Doctors / Staff</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal("new")}>Add Staff</button>
      </div>

      {doctors.length === 0 ? (
        <EmptyState title="No staff profiles yet">Add your first team member.</EmptyState>
      ) : (
        <div className="grid cols-3">
          {doctors.map((d) => (
            <article className="card person" key={d.id}>
              <Photo src={d.photoUrl} alt={d.name} className="avatar" icon="user" ratio="4 / 4.2" />
              <div className="card-body">
                <h3>{d.name}</h3>
                <span className="role">{d.position}</span>
                <span className="spec">{d.specialization}</span>
                {!d.isActive && <span className="badge gray" style={{ alignSelf: "flex-start" }}>Inactive</span>}
                <div className="card-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setModal(d)}>Edit</button>
                  <ToggleButton
                    url={`/api/admin/doctors/${d.id}`}
                    field="isActive"
                    value={d.isActive}
                    onLabel="Deactivate"
                    offLabel="Activate"
                  />
                  <DeleteButton url={`/api/admin/doctors/${d.id}`} confirmText={`Remove ${d.name}? This cannot be undone.`} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <DoctorFormModal doctor={modal === "new" ? null : modal} onClose={() => setModal(null)} />
      )}
    </>
  );
}
