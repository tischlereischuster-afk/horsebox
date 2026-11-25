import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="topbar">
        <Link href="/">🐴 Horsebox</Link>
        <Link href="/dashboard">Anmelden</Link>
      </div>
      <div className="container">
        <div className="card">
          <h1>Ein Pferd. Ein Link. Alles drin.</h1>
          <p>
            Lege dein Verkaufspferd einmal an: Name, Abstammung, Links zu Rimondo und FN, dazu Videos,
            Fotos, Röntgenbilder und Dokumente per Drag &amp; Drop. Dann schickst du dem Kunden nur noch
            einen Link per WhatsApp. Er kann alles ansehen und herunterladen.
          </p>
          <div className="row">
            <Link className="btn" href="/dashboard">Zu meinen Pferden</Link>
            <Link className="btn secondary" href="/login?mode=signup">Konto anlegen</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
