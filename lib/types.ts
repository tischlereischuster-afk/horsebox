export type MediaCategory = "video" | "photo" | "xray" | "document";

export const CATEGORIES: { key: MediaCategory; label: string; accept: string; hint: string }[] = [
  { key: "video", label: "Videos", accept: "video/*", hint: "MP4, MOV …" },
  { key: "photo", label: "Fotos", accept: "image/*", hint: "JPG, PNG, HEIC …" },
  { key: "xray", label: "Röntgenbilder", accept: "image/*,application/pdf,.dcm", hint: "Bilder, PDF, DICOM" },
  { key: "document", label: "Dokumente", accept: "application/pdf,image/*,.doc,.docx", hint: "Equidenpass, TÜV, Kaufvertrag …" },
];

export function categoryLabel(c: MediaCategory) {
  return CATEGORIES.find((x) => x.key === c)?.label ?? c;
}

export function isMediaCategory(v: unknown): v is MediaCategory {
  return v === "video" || v === "photo" || v === "xray" || v === "document";
}

export type Horse = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  birth_year: number | null;
  sex: string | null;
  color: string | null;
  breed: string | null;
  height_cm: number | null;
  sire: string | null;
  dam: string | null;
  dam_sire: string | null;
  description: string | null;
  price_info: string | null;
  rimondo_url: string | null;
  fn_url: string | null;
  is_public: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  stable_name: string | null;
  location: string | null;
  phone: string | null;
};

/** Handynummer für WhatsApp-Links: nur Ziffern, mit Ländervorwahl (0171… wird zu 49171…). */
export function waNumber(phone: string | null | undefined) {
  if (!phone) return null;
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "49" + d.slice(1);
  d = d.replace(/\D/g, "");
  return d.length >= 8 ? d : null;
}

export type Media = {
  id: string;
  horse_id: string;
  category: MediaCategory;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export function formatBytes(n: number | null | undefined) {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1).replace(".", ",")} ${units[i]}`;
}

/** Kurzbeschreibung wie "Wallach, 2019, v. Diamant de Semilly x Cornet Obolensky" */
export function horseSubtitle(h: Pick<Horse, "sex" | "birth_year" | "sire" | "dam_sire" | "height_cm">) {
  const parts: string[] = [];
  if (h.sex) parts.push(h.sex);
  if (h.birth_year) parts.push(String(h.birth_year));
  if (h.height_cm) parts.push(`${h.height_cm} cm`);
  let line = parts.join(", ");
  if (h.sire) line += `${line ? ", " : ""}v. ${h.sire}${h.dam_sire ? ` x ${h.dam_sire}` : ""}`;
  return line;
}
