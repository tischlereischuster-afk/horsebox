import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { horseSubtitle, type Horse } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: horses, error } = await supabase
    .from("horses")
    .select("*, media(count)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Meine Pferde</h1>
        <Link className="btn" href="/dashboard/neu">+ Pferd anlegen</Link>
      </div>
      {error && <p className="error">Fehler beim Laden: {error.message}</p>}
      {horses && horses.length === 0 && (
        <div className="card">
          <p>Noch keine Pferde angelegt.</p>
          <Link className="btn" href="/dashboard/neu">Erstes Pferd anlegen</Link>
        </div>
      )}
      <div className="grid">
        {(horses ?? []).map((h: Horse & { media: { count: number }[] }) => (
          <Link key={h.id} href={`/dashboard/${h.id}`} className="card" style={{ textDecoration: "none", color: "inherit", margin: 0 }}>
            <h3>{h.name}</h3>
            <p className="small muted" style={{ margin: 0 }}>{horseSubtitle(h) || "–"}</p>
            <p className="small" style={{ margin: "8px 0 0" }}>
              <span className="badge">{h.media?.[0]?.count ?? 0} Dateien</span>{" "}
              {!h.is_public && <span className="badge">Link inaktiv</span>}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
