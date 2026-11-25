import { design } from "@/lib/design";
import { ImageResponse } from "next/og";
import { getPublicHorse } from "@/lib/public-horse";
import { withSignedUrls } from "@/lib/signed-urls";
import { horseSubtitle } from "@/lib/types";

// Das Vorschaubild, das WhatsApp, iMessage usw. beim Teilen des Links anzeigen.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pferd";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicHorse(slug);
  const horse = data?.horse;
  // Erstes Foto im Format JPG oder PNG als Hintergrund
  const photo = data?.media.find((m) => m.category === "photo" && /image\/(jpe?g|png)/.test(m.mime_type ?? ""));
  const [signed] = photo ? await withSignedUrls([photo], 600) : [];
  const bg = signed?.viewUrl ? await toDataUrl(signed.viewUrl, photo!.mime_type!) : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: design().ogBackground, color: design().ogText, fontFamily: "sans-serif" }}>
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 56px", display: "flex", flexDirection: "column", background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{horse?.name ?? "Horsebox"}</div>
          <div style={{ fontSize: 34, opacity: 0.9 }}>{horse ? horseSubtitle(horse) : ""}</div>
          <div style={{ fontSize: 26, opacity: 0.8, marginTop: 8 }}>Videos · Fotos · Röntgen · Abstammung</div>
        </div>
      </div>
    ),
    size,
  );
}

/** Foto selbst laden und einbetten. Klappt das nicht (oder ist es zu groß), gibt es eine Vorschau ohne Foto. */
async function toDataUrl(url: string, mime: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
