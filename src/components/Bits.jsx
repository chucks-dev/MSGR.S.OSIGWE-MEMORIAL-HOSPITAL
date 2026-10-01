import { Icon } from "./Icons";
import { paragraphs } from "@/lib/format";

export function Badge({ map, value }) {
  const b = map[value] || { label: value, cls: "gray" };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

export function Paragraphs({ text }) {
  return paragraphs(text).map((p, i) => <p key={i}>{p}</p>);
}

export function PageHero({ title, children }) {
  return (
    <div className="page-hero">
      <div className="wrap">
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

/**
 * Shows an uploaded image, or a calm placeholder block when none has been uploaded yet.
 * Uses a plain <img> for uploaded files so they work without image-optimizer configuration.
 */
export function Photo({ src, alt, className = "", icon = "stethoscope", ratio = "16 / 10", style }) {
  if (src) {
    return <img src={src} alt={alt} className={className} style={style} loading="lazy" decoding="async" />;
  }
  return (
    <div
      className={`${className} avatar-fallback`}
      style={{ aspectRatio: ratio, ...style }}
      role="img"
      aria-label={`${alt} (photo to be added)`}
    >
      <Icon name={icon} />
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <strong style={{ color: "var(--navy)", display: "block", marginBottom: "0.25rem" }}>{title}</strong>
      {children}
    </div>
  );
}
