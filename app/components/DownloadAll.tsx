"use client";

import { useState } from "react";

/**
 * Lädt mehrere Dateien nacheinander herunter.
 * (Der Browser fragt evtl. einmal, ob mehrere Downloads erlaubt sind.)
 * Später möglich: alles als eine ZIP-Datei, siehe README.
 */
export default function DownloadAll({ urls, label }: { urls: string[]; label: string }) {
  const [busy, setBusy] = useState(false);
  if (urls.length === 0) return null;

  async function run() {
    setBusy(true);
    for (const url of urls) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 60_000);
      await new Promise((r) => setTimeout(r, 800));
    }
    setBusy(false);
  }

  return (
    <button className="btn secondary small" type="button" onClick={run} disabled={busy}>
      {busy ? "Download läuft …" : `${label} (${urls.length})`}
    </button>
  );
}
