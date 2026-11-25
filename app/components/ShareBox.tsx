"use client";

import { useState } from "react";

/** Teilen-Link mit Knöpfen: Kopieren, per WhatsApp senden, Seite öffnen. */
export default function ShareBox({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Hier alle Infos, Videos und Bilder zu ${name}: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Link kopieren:", url);
    }
  }

  async function nativeShare() {
    if (navigator.share) await navigator.share({ title: name, text, url }).catch(() => {});
    else copy();
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input readOnly value={url} onFocus={(e) => e.target.select()} />
      <div className="row">
        <a className="btn wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
          Per WhatsApp senden
        </a>
        <button className="btn secondary" type="button" onClick={copy}>{copied ? "Kopiert ✓" : "Link kopieren"}</button>
        <button className="btn secondary" type="button" onClick={nativeShare}>Teilen …</button>
        <a className="btn secondary" href={url} target="_blank" rel="noreferrer">Kundenansicht öffnen</a>
      </div>
    </div>
  );
}
