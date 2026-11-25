import HorseForm from "../HorseForm";
import { createHorse } from "../actions";

export default function NewHorsePage() {
  return (
    <>
      <h1>Neues Pferd anlegen</h1>
      <p className="muted">Erst die Daten, im nächsten Schritt lädst du Videos, Fotos und Röntgenbilder hoch.</p>
      <div className="card">
        <HorseForm action={createHorse} submitLabel="Speichern und weiter zu den Medien" />
      </div>
    </>
  );
}
