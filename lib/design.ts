/**
 * Design der App. Es gibt drei Designs zur Auswahl:
 *  - "stall"   : Klassisch, Dunkelgrün / Beige / Gold (Reitstall-Look)
 *  - "sport"   : Modern & hell, Marineblau / Orange (sportlich, klar)
 *  - "premium" : Dunkel & edel, Schwarz / Gold, Serifenschrift (Auktions-Look)
 * Umschalten: Umgebungsvariable NEXT_PUBLIC_DESIGN setzen (z. B. in Vercel) und neu deployen.
 * Die Farben selbst stehen in app/globals.css.
 */
export const DESIGNS = {
  stall: { label: "Stall (klassisch)", themeColor: "#2f4a3a", background: "#f6f3ee", ogBackground: "#2f4a3a", ogText: "#ffffff" },
  sport: { label: "Sport (modern hell)", themeColor: "#0f2a4a", background: "#f3f5f8", ogBackground: "#0f2a4a", ogText: "#ffffff" },
  premium: { label: "Premium (dunkel)", themeColor: "#0e0e0f", background: "#0e0e0f", ogBackground: "#0e0e0f", ogText: "#e6cf9a" },
} as const;

export type DesignKey = keyof typeof DESIGNS;

export function currentDesign(): DesignKey {
  const d = process.env.NEXT_PUBLIC_DESIGN;
  return d && d in DESIGNS ? (d as DesignKey) : "stall";
}

export const design = () => DESIGNS[currentDesign()];
