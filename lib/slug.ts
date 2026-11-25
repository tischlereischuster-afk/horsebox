/** Macht aus "Cornet's Darling" -> "cornets-darling-k3x9qa". Der Zufallsteil macht den Link nicht erratbar. */
export function makeSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pferd";
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32])
    .join("");
  return `${base}-${rand}`;
}

/** Dateiname für den Speicher: nur sichere Zeichen. */
export function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(-120);
  return cleaned || "datei";
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
