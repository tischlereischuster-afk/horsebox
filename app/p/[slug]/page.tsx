import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicHorse } from "@/lib/public-horse";
import { withSignedUrls } from "@/lib/signed-urls";
import { CATEGORIES, horseSubtitle } from "@/lib/types";
import MediaTile from "@/app/components/MediaTile";
import DownloadAll from "@/app/components/DownloadAll";
import SellerCard from "@/app/components/SellerCard";
import { siteUrl } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Immer frisch laden, damit die zeitlich begrenzten Links gültig sind
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** Titel und Beschreibung für die Link-Vorschau in WhatsApp (Open Graph). Das Bild kommt aus opengraph-image.tsx */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicHorse(slug);
  if (!data) return { title: "Pferd nicht gefunden" };
  const { horse } = data;
  const description = [horseSubtitle(horse), horse.price_info].filter(Boolean).join(" · ") || "Videos, Fotos, Röntgenbilder und Abstammung";
  return {
    title: horse.name,
    description,
    openGraph: { title: horse.name, description, type: "website", url: `/p/${horse.slug}` },
    robots: { index: false, follow: false }, // nicht bei Google auffindbar, nur per Link
  };
}

export default async function PublicHorsePage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicHorse(slug);
  if (!data) notFound();
  const { horse } = data;
  const media = await withSignedUrls(data.media);
  const cover = media.find((m) => m.category === "photo" && m.viewUrl && (m.mime_type ?? "").startsWith("image/"));
  const facts: [string, string | number | null][] = [
    ["Geschlecht", horse.sex],
    ["Geburtsjahr", horse.birth_year],
    ["Stockmaß", horse.height_cm ? `${horse.height_cm} cm` : null],
    ["Farbe", horse.color],
    ["Rasse", horse.breed],
    ["Preis", horse.price_info],
  ];
  const allDownloads = media.map((m) => m.downloadUrl).filter((u): u is string => !!u);

  // Ist der Verkäufer selbst eingeloggt? Dann oben eine Leiste mit dem Weg zurück zeigen (Kunden sehen sie nicht).
  const { data: auth } = await (await createClient()).auth.getUser().catch(() => ({ data: { user: null } }));
  const isOwner = auth.user?.id === horse.owner_id;

  return (
    <main>
      {isOwner && (
        <div className="owner-bar">
          <Link className="btn owner-back" href="/dashboard">← Zurück zur Übersicht</Link>
          <span className="owner-hint">So sehen deine Kunden das Pferd</span>
          <Link className="btn secondary" href={`/dashboard/${horse.id}`}>Bearbeiten</Link>
        </div>
      )}
      <div className="hero">
        {cover?.viewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.viewUrl} alt={horse.name} />
        )}
        <div className="hero-text container">
          <h1 style={{ fontSize: "2rem" }}>{horse.name}</h1>
          <div>{horseSubtitle(horse)}</div>
        </div>
      </div>

      <div className="container">
        <section className="card">
          <dl className="facts" style={{ margin: 0 }}>
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {horse.description && <p style={{ whiteSpace: "pre-wrap" }}>{horse.description}</p>}
          <div className="row" style={{ marginTop: 12 }}>
            {horse.rimondo_url && <a className="btn secondary" href={horse.rimondo_url} target="_blank" rel="noreferrer">Bei Rimondo ansehen ↗</a>}
            {horse.fn_url && <a className="btn secondary" href={horse.fn_url} target="_blank" rel="noreferrer">Abstammung bei der FN ↗</a>}
            <DownloadAll urls={allDownloads} label="Alles herunterladen" />
          </div>
        </section>

        {(horse.sire || horse.dam || horse.dam_sire) && (
          <section className="card">
            <h2>Abstammung</h2>
            <div className="pedigree">
              <div><span className="small muted">Vater</span><br /><strong>{horse.sire ?? "–"}</strong></div>
              <div><span className="small muted">Mutter</span><br /><strong>{horse.dam ?? "–"}</strong>{horse.dam_sire && <span className="small"> v. {horse.dam_sire}</span>}</div>
            </div>
          </section>
        )}

        <nav className="tabs" style={{ marginBottom: 12 }}>
          {CATEGORIES.map((c) => {
            const n = media.filter((m) => m.category === c.key).length;
            return n ? <a key={c.key} className="btn small secondary" href={`#${c.key}`}>{c.label} ({n})</a> : null;
          })}
        </nav>

        {CATEGORIES.map((c) => {
          const items = media.filter((m) => m.category === c.key);
          if (!items.length) return null;
          return (
            <section key={c.key} id={c.key} className="card">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>{c.label}</h2>
                <DownloadAll urls={items.map((m) => m.downloadUrl).filter((u): u is string => !!u)} label="Alle laden" />
              </div>
              <div className="media-grid">
                {items.map((m) => (
                  <MediaTile key={m.id} m={m}>
                    {m.downloadUrl && <a className="btn small secondary" href={m.downloadUrl}>Herunterladen</a>}
                  </MediaTile>
                ))}
              </div>
            </section>
          );
        })}

        <SellerCard seller={data.seller} horseName={horse.name} pageUrl={`${siteUrl()}/p/${horse.slug}`} />

        {media.length === 0 && <p className="muted">Für dieses Pferd wurden noch keine Dateien hochgeladen.</p>}
        <p className="small muted" style={{ textAlign: "center", margin: "32px 0" }}>Erstellt mit <Link href="/" className="muted">Horsebox</Link></p>
      </div>
    </main>
  );
}
