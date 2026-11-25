import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withSignedUrls } from "@/lib/signed-urls";
import { CATEGORIES, type Horse, type Media } from "@/lib/types";
import { siteUrl } from "@/lib/slug";
import HorseForm from "../HorseForm";
import { updateHorse, deleteHorse } from "../actions";
import MediaSection from "./MediaSection";
import ShareBox from "@/app/components/ShareBox";
import ConfirmButton from "@/app/components/ConfirmButton";

export default async function EditHorsePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ neu?: string; gespeichert?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: horse } = await supabase.from("horses").select("*").eq("id", id).maybeSingle<Horse>();
  if (!horse) notFound();

  const { data: mediaRows } = await supabase
    .from("media")
    .select("*")
    .eq("horse_id", id)
    .order("sort_order")
    .order("created_at");
  const media = await withSignedUrls((mediaRows ?? []) as Media[], 60 * 60);
  const publicUrl = `${siteUrl()}/p/${horse.slug}`;

  return (
    <>
      <h1>{horse.name}</h1>
      {sp.neu && <p className="badge">Angelegt! Jetzt Medien hochladen.</p>}
      {sp.gespeichert && <p className="badge">Gespeichert ✓</p>}

      <section className="card">
        <h2>Link für den Kunden</h2>
        {horse.is_public ? (
          <ShareBox url={publicUrl} name={horse.name} />
        ) : (
          <p className="muted">Der Link ist gerade deaktiviert. Unten bei den Daten wieder einschalten.</p>
        )}
      </section>

      {CATEGORIES.map((c) => (
        <MediaSection
          key={c.key}
          horseId={horse.id}
          category={c.key}
          label={c.label}
          accept={c.accept}
          hint={c.hint}
          items={media.filter((m) => m.category === c.key)}
        />
      ))}

      <section className="card">
        <h2>Daten des Pferdes</h2>
        <HorseForm action={updateHorse.bind(null, horse.id)} horse={horse} submitLabel="Änderungen speichern" />
      </section>

      <form action={deleteHorse.bind(null, horse.id)} style={{ margin: "24px 0 48px" }}>
        <ConfirmButton message="Pferd und alle Dateien endgültig löschen?">Pferd mit allen Dateien löschen</ConfirmButton>
      </form>
    </>
  );
}
