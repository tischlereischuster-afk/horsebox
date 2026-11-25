import type { Horse } from "@/lib/types";

type Props = {
  action: (fd: FormData) => Promise<void>;
  horse?: Partial<Horse>;
  submitLabel: string;
};

/** Formular für die Stammdaten eines Pferdes (Anlegen und Bearbeiten). */
export default function HorseForm({ action, horse = {}, submitLabel }: Props) {
  const f = (k: keyof Horse) => (horse[k] ?? "") as string | number;
  return (
    <form action={action} style={{ display: "grid", gap: 16 }}>
      <div className="form-grid">
        <div>
          <label htmlFor="name">Name des Pferdes *</label>
          <input id="name" name="name" required defaultValue={f("name")} />
        </div>
        <div>
          <label htmlFor="birth_year">Geburtsjahr</label>
          <input id="birth_year" name="birth_year" type="number" min={1990} max={2100} defaultValue={f("birth_year")} />
        </div>
        <div>
          <label htmlFor="sex">Geschlecht</label>
          <select id="sex" name="sex" defaultValue={f("sex")}>
            <option value="">–</option>
            <option>Stute</option>
            <option>Wallach</option>
            <option>Hengst</option>
          </select>
        </div>
        <div>
          <label htmlFor="height_cm">Stockmaß (cm)</label>
          <input id="height_cm" name="height_cm" type="number" min={80} max={210} defaultValue={f("height_cm")} />
        </div>
        <div>
          <label htmlFor="color">Farbe</label>
          <input id="color" name="color" placeholder="z. B. Dunkelbraun" defaultValue={f("color")} />
        </div>
        <div>
          <label htmlFor="breed">Rasse / Verband</label>
          <input id="breed" name="breed" placeholder="z. B. Holsteiner" defaultValue={f("breed")} />
        </div>
      </div>

      <fieldset className="card" style={{ margin: 0 }}>
        <legend><strong>Abstammung</strong></legend>
        <div className="form-grid">
          <div>
            <label htmlFor="sire">Vater</label>
            <input id="sire" name="sire" defaultValue={f("sire")} />
          </div>
          <div>
            <label htmlFor="dam">Mutter</label>
            <input id="dam" name="dam" defaultValue={f("dam")} />
          </div>
          <div>
            <label htmlFor="dam_sire">Muttervater</label>
            <input id="dam_sire" name="dam_sire" defaultValue={f("dam_sire")} />
          </div>
        </div>
      </fieldset>

      <div className="form-grid">
        <div>
          <label htmlFor="rimondo_url">Link zu Rimondo</label>
          <input id="rimondo_url" name="rimondo_url" type="text" inputMode="url" placeholder="https://rimondo.com/…" defaultValue={f("rimondo_url")} />
        </div>
        <div>
          <label htmlFor="fn_url">Link zur FN / Abstammung</label>
          <input id="fn_url" name="fn_url" type="text" inputMode="url" placeholder="https://…" defaultValue={f("fn_url")} />
        </div>
        <div>
          <label htmlFor="price_info">Preis</label>
          <input id="price_info" name="price_info" placeholder="z. B. auf Anfrage" defaultValue={f("price_info")} />
        </div>
      </div>

      <div>
        <label htmlFor="description">Beschreibung</label>
        <textarea id="description" name="description" placeholder="Charakter, Ausbildungsstand, Erfolge, Erfolge der Mutter …" defaultValue={f("description")} />
      </div>

      <label className="row" style={{ fontWeight: 400 }}>
        <input type="checkbox" name="is_public" defaultChecked={horse.is_public ?? true} style={{ width: "auto" }} />
        Teilen-Link ist aktiv (Kunden können die Seite öffnen)
      </label>

      <div><button className="btn" type="submit">{submitLabel}</button></div>
    </form>
  );
}
