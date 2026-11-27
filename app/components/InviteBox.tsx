"use client";

import { useState } from "react";

/** Kasten „Kollegen einladen“: Einladungslink zur Registrierung per WhatsApp, Kopieren oder Teilen-Menü. */
export default function InviteBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const text =
    `Schau dir mal Horsebox an: Damit schickst du Kunden alle Videos, Fotos, Röntgenbilder und die Abstammung eines Pferdes mit einem einzigen Link. ` +
    `Hier kannst du dich kostenlos anmelden: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Einladung kopieren:", text);
    }
  }

  async function nativeShare() {
    if (navigator.share) await navigator.share({ title: "Einladung zu Horsebox", text, url }).catch(() => {});
    else copy();
  }

  return (
    <section className="card" id="einladen">
      <h2>Kollegen einladen</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Schick Händlerkollegen, Reitern oder Züchtern einen Link. Sie können sich damit selbst ein Konto anlegen.
      </p>
      <div className="row">
        <a className="btn wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
          Per WhatsApp einladen
        </a>
        <button className="btn secondary" type="button" onClick={copy}>{copied ? "Kopiert ✓" : "Einladung kopieren"}</button>
        <button className="btn secondary" type="button" onClick={nativeShare}>Teilen …</button>
      </div>
    </section>
  );
}
