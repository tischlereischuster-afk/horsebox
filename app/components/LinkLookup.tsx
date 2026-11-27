"use client";

/**
 * Feld für einen Link (Rimondo / FN) mit Knöpfen daneben:
 * „Suchen“ öffnet die Seite mit dem Pferdenamen, „Einfügen“ setzt den kopierten Link ein.
 */
export default function LinkLookup({
  id, label, placeholder, defaultValue, site, siteLabel, homepage,
}: {
  id: string; label: string; placeholder: string; defaultValue: string;
  site: string; siteLabel: string; homepage: string;
}) {
  function search() {
    const name = (document.getElementById("name") as HTMLInputElement | null)?.value.trim();
    const url = name
      ? `https://www.google.com/search?q=${encodeURIComponent(`"${name}" site:${site}`)}`
      : homepage;
    window.open(url, "_blank", "noopener");
  }

  async function paste() {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) input.value = text;
    } catch {
      input.focus(); // Browser erlaubt kein Auslesen: dann einfach lange ins Feld tippen und „Einfügen“ wählen
    }
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type="text" inputMode="url" placeholder={placeholder} defaultValue={defaultValue} />
      <div className="row" style={{ marginTop: 6 }}>
        <button type="button" className="btn small secondary" onClick={search}>Bei {siteLabel} suchen ↗</button>
        <button type="button" className="btn small secondary" onClick={paste}>Link einfügen</button>
      </div>
    </div>
  );
}
