"use client";

import { useState } from "react";
import { Photo, EmptyState, Badge } from "./Bits";
import { ToggleButton, DeleteButton } from "./AdminActions";
import ArticleFormModal from "./ArticleFormModal";
import { formatDate } from "@/lib/format";

export default function NewsAdmin({ articles }) {
  const [modal, setModal] = useState(null);

  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>News</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal("new")}>New Article</button>
      </div>

      {articles.length === 0 ? (
        <EmptyState title="No articles yet">Create your first article.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th></th><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td style={{ width: 64 }}>
                    <Photo src={a.imageUrl} alt="" className="card-img" ratio="1" style={{ width: 48, height: 48, borderRadius: 8 }} />
                  </td>
                  <td>{a.title}</td>
                  <td>{a.category}</td>
                  <td><Badge map={{ true: { label: "Published", cls: "green" }, false: { label: "Draft", cls: "gray" } }} value={String(a.isPublished)} /></td>
                  <td>{formatDate(a.publishedAt || a.createdAt)}</td>
                  <td className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setModal(a)}>Edit</button>
                    <ToggleButton url={`/api/admin/news/${a.id}`} field="isPublished" value={a.isPublished} onLabel="Unpublish" offLabel="Publish" />
                    <DeleteButton url={`/api/admin/news/${a.id}`} confirmText={`Delete "${a.title}"? This cannot be undone.`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ArticleFormModal article={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </>
  );
}
