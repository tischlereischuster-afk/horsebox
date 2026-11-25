import { waNumber, type Profile } from "@/lib/types";

/** Kasten „Verkäufer“ auf der Kundenseite, mit WhatsApp- und Anruf-Knopf. */
export default function SellerCard({ seller, horseName, pageUrl }: { seller: Profile | null; horseName: string; pageUrl: string }) {
  if (!seller || !(seller.display_name || seller.stable_name || seller.phone)) return null;
  const wa = waNumber(seller.phone);
  const text = `Hallo, ich interessiere mich für ${horseName}: ${pageUrl}`;
  return (
    <section className="card" id="verkaeufer">
      <h2>Verkäufer</h2>
      <p style={{ margin: "0 0 12px" }}>
        {seller.stable_name && <strong>{seller.stable_name}</strong>}
        {seller.stable_name && seller.display_name && <br />}
        {seller.display_name && <span>{seller.display_name}</span>}
        {seller.location && <span className="muted"> · {seller.location}</span>}
      </p>
      <div className="row">
        {wa && (
          <a className="btn wa" href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
            Per WhatsApp fragen
          </a>
        )}
        {seller.phone && <a className="btn secondary" href={`tel:${seller.phone.replace(/[^\d+]/g, "")}`}>Anrufen</a>}
      </div>
    </section>
  );
}
