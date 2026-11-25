import { createClient } from "@/lib/supabase/server";
import { waNumber, type Profile } from "@/lib/types";
import { saveProfile } from "../actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ gespeichert?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: p } = await supabase.from("profiles").select("*").eq("id", auth.user?.id ?? "").maybeSingle<Profile>();
  const v = (k: keyof Profile) => p?.[k] ?? "";

  return (
    <>
      <h1>Mein Profil</h1>
      <p className="muted">
        Diese Angaben sieht der Kunde unten auf der Seite jedes Pferdes. Mit deiner Handynummer bekommt er einen Knopf
        „Per WhatsApp fragen“ und kann dich direkt anschreiben.
      </p>
      {sp.gespeichert && <p className="badge">Gespeichert ✓</p>}
      <form action={saveProfile} className="card" style={{ display: "grid", gap: 16 }}>
        <div className="form-grid">
          <div>
            <label htmlFor="display_name">Dein Name</label>
            <input id="display_name" name="display_name" placeholder="z. B. Max Mustermann" defaultValue={v("display_name")} />
          </div>
          <div>
            <label htmlFor="stable_name">Stall / Firma</label>
            <input id="stable_name" name="stable_name" placeholder="z. B. Pferdehof Sonnental" defaultValue={v("stable_name")} />
          </div>
          <div>
            <label htmlFor="location">Ort</label>
            <input id="location" name="location" placeholder="z. B. Lüneburg" defaultValue={v("location")} />
          </div>
          <div>
            <label htmlFor="phone">Handynummer (für WhatsApp)</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" placeholder="z. B. 0171 1234567" defaultValue={v("phone")} />
          </div>
        </div>
        {p?.phone && !waNumber(p.phone) && <p className="error small">Die Handynummer sieht ungültig aus. Bitte prüfen.</p>}
        <div><button className="btn" type="submit">Profil speichern</button></div>
      </form>
    </>
  );
}
