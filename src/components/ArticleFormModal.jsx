"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextArea, SelectField, Checkbox } from "./Fields";
import { submitForm } from "@/lib/client";

const CATEGORIES = ["Health Tips", "Hospital News", "Community Outreach", "Medical Awareness", "Events"];

export default function ArticleFormModal({ article, onClose }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(article);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    fd.set("publish", fd.get("publish") === "on" ? "true" : "false");
    const res = await submitForm(isEdit ? `/api/admin/news/${article.id}` : "/api/admin/news", fd, isEdit ? "PUT" : "POST");
    setBusy(false);
    if (res.ok) {
      router.refresh();
      onClose();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit article" : "New article"} style={{ maxWidth: 640, borderTopColor: "var(--navy)", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ color: "var(--navy)" }}>{isEdit ? "Edit Article" : "New Article"}</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          {message && <div className="alert error" role="alert">{message}</div>}
          <TextField label="Title" name="title" defaultValue={article?.title} required error={errors.title} />
          <div className="grid cols-2">
            <SelectField label="Category" name="category" defaultValue={article?.category || CATEGORIES[0]} error={errors.category}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectField>
            <TextField label="Author" name="author" defaultValue={article?.author || "Hospital Administration"} required error={errors.author} />
          </div>
          <TextField label="Short excerpt" name="excerpt" defaultValue={article?.excerpt} maxLength={300} required error={errors.excerpt} hint="Shown on article cards." />
          <TextArea label="Article content" name="content" defaultValue={article?.content} rows={8} required error={errors.content} hint="Separate paragraphs with a blank line." />
          <div className="field">
            <label htmlFor="image">Featured image (JPG, PNG or WebP, max 3MB)</label>
            <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
            {errors.image && <span className="error-text" role="alert">{errors.image}</span>}
          </div>
          <Checkbox label="Publish immediately" name="publish" defaultChecked={article?.isPublished ?? true} />
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
