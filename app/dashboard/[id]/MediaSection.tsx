"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBytes, type MediaCategory } from "@/lib/types";
import type { MediaWithUrls } from "@/lib/signed-urls";
import MediaTile from "@/app/components/MediaTile";

type Upload = { id: string; name: string; progress: number; error?: string; done?: boolean };

const PARALLEL = 3; // so viele Dateien gleichzeitig hochladen

/** Lädt eine Datei direkt in den Speicher hoch und meldet den Fortschritt. */
function putFile(url: string, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload fehlgeschlagen (${xhr.status}): ${xhr.responseText.slice(0, 200)}`)));
    xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload"));
    xhr.send(file);
  });
}

export default function MediaSection({
  horseId,
  category,
  label,
  accept,
  hint,
  items,
}: {
  horseId: string;
  category: MediaCategory;
  label: string;
  accept: string;
  hint: string;
  items: MediaWithUrls[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);

  const update = (id: string, patch: Partial<Upload>) =>
    setUploads((u) => u.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const uploadOne = useCallback(
    async (file: File, id: string) => {
      try {
        const r1 = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ horseId, category, fileName: file.name }),
        });
        const j1 = await r1.json();
        if (!r1.ok) throw new Error(j1.error ?? "Kein Upload-Link");

        await putFile(j1.signedUrl, file, (p) => update(id, { progress: p }));

        const r2 = await fetch("/api/media", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ horseId, category, path: j1.path, fileName: file.name, size: file.size, mimeType: file.type }),
        });
        if (!r2.ok) throw new Error((await r2.json()).error ?? "Speichern fehlgeschlagen");
        update(id, { progress: 1, done: true });
      } catch (e) {
        update(id, { error: (e as Error).message });
      }
    },
    [horseId, category],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;
      const batch = files.map((f) => ({ file: f, id: crypto.randomUUID() }));
      setUploads((u) => [...u, ...batch.map(({ file, id }) => ({ id, name: file.name, progress: 0 }))]);

      // Warteschlange: immer PARALLEL Dateien gleichzeitig
      const queue = [...batch];
      await Promise.all(
        Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
          while (queue.length) {
            const next = queue.shift()!;
            await uploadOne(next.file, next.id);
          }
        }),
      );
      router.refresh();
      setUploads((u) => u.filter((x) => !x.done));
    },
    [uploadOne, router],
  );

  async function move(id: string, action: "up" | "down" | "first") {
    const r = await fetch("/api/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!r.ok) alert("Verschieben fehlgeschlagen");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Diese Datei wirklich löschen?")) return;
    const r = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    if (!r.ok) alert("Löschen fehlgeschlagen");
    router.refresh();
  }

  return (
    <section className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{label}</h2>
        <span className="badge">{items.length}</span>
      </div>

      <div
        className={`dropzone ${active ? "active" : ""}`}
        style={{ margin: "12px 0" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setActive(true); }}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => { e.preventDefault(); setActive(false); handleFiles(e.dataTransfer.files); }}
      >
        <strong>Dateien hierher ziehen</strong> oder tippen zum Auswählen
        <div className="small muted">{hint}</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          hidden
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {uploads.map((u) => (
        <div key={u.id} style={{ marginBottom: 8 }}>
          <div className="small row" style={{ justifyContent: "space-between" }}>
            <span>{u.name}</span>
            <span>{u.error ? "" : `${Math.round(u.progress * 100)} %`}</span>
          </div>
          {u.error ? <div className="small error">{u.error}</div> : <div className="progress"><div style={{ width: `${u.progress * 100}%` }} /></div>}
        </div>
      ))}

      {items.length > 0 && (
        <div className="media-grid">
          {items.map((m, i) => (
            <MediaTile key={m.id} m={m}>
              <span className="small muted">{formatBytes(m.size_bytes)}</span>
              {category === "photo" && i === 0 && <span className="badge">★ Titelbild</span>}
              {items.length > 1 && (
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn small secondary" title="Nach vorne" disabled={i === 0} onClick={() => move(m.id, "up")}>◀</button>
                  <button className="btn small secondary" title="Nach hinten" disabled={i === items.length - 1} onClick={() => move(m.id, "down")}>▶</button>
                  {category === "photo" && i > 0 && (
                    <button className="btn small secondary" onClick={() => move(m.id, "first")}>★ Titelbild</button>
                  )}
                </div>
              )}
              <button className="btn small danger" onClick={() => remove(m.id)}>Löschen</button>
            </MediaTile>
          ))}
        </div>
      )}
    </section>
  );
}
