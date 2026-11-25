import type { MediaWithUrls } from "@/lib/signed-urls";

const isImage = (m: MediaWithUrls) => (m.mime_type ?? "").startsWith("image/") && !m.mime_type?.includes("heic");
const isVideo = (m: MediaWithUrls) => (m.mime_type ?? "").startsWith("video/");

/** Eine Kachel: Vorschau (Bild / Video / Datei-Symbol) plus Name und Aktionen. */
export default function MediaTile({ m, children }: { m: MediaWithUrls; children?: React.ReactNode }) {
  return (
    <div className="media-item">
      {m.viewUrl && isVideo(m) ? (
        // preload="metadata" lädt nur den Anfang, das Video streamt erst beim Abspielen
        <video src={m.viewUrl} controls preload="metadata" playsInline />
      ) : m.viewUrl && isImage(m) ? (
        <a href={m.viewUrl} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.viewUrl} alt={m.file_name} loading="lazy" />
        </a>
      ) : (
        <a className="file-icon" href={m.viewUrl ?? "#"} target="_blank" rel="noreferrer">
          {m.category === "xray" ? "🩻" : "📄"}
        </a>
      )}
      <div className="meta">
        <span className="name" title={m.file_name}>{m.file_name}</span>
        {children}
      </div>
    </div>
  );
}
