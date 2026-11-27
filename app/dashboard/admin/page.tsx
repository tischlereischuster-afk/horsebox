import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import ConfirmButton from "@/app/components/ConfirmButton";
import { banUser, unbanUser, deleteUser } from "./actions";

export const dynamic = "force-dynamic";

function date(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }) : "–";
}

export default async function AdminPage() {
  const me = await requireAdmin();
  const db = createAdminClient();

  const { data: list, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const users = (list?.users ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data: profiles } = await db.from("profiles").select("id, display_name, stable_name, location, phone");
  const { data: horses } = await db.from("horses").select("owner_id");
  const profileOf = new Map((profiles ?? []).map((p: Profile) => [p.id, p]));
  const horseCount = new Map<string, number>();
  for (const h of horses ?? []) horseCount.set(h.owner_id, (horseCount.get(h.owner_id) ?? 0) + 1);

  const now = Date.now();
  const isBanned = (u: { banned_until?: string }) => !!u.banned_until && new Date(u.banned_until).getTime() > now;

  return (
    <>
      <h1>Konten verwalten</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {users.length} {users.length === 1 ? "Konto" : "Konten"} registriert · {horses?.length ?? 0} Pferde insgesamt
      </p>
      {error && <p className="error">Fehler beim Laden: {error.message}</p>}

      <div className="account-list">
        {users.map((u) => {
          const p = profileOf.get(u.id);
          const banned = isBanned(u);
          const self = u.id === me.id;
          return (
            <section key={u.id} className="card account">
              <div className="account-head">
                <div>
                  <strong>{p?.stable_name || p?.display_name || u.email}</strong>
                  {(p?.stable_name || p?.display_name) && <div className="small">{[p?.display_name, p?.location].filter(Boolean).join(" · ")}</div>}
                  <div className="small muted">{u.email}{p?.phone ? ` · ${p.phone}` : ""}</div>
                </div>
                <div className="row">
                  {self && <span className="badge">Du</span>}
                  {banned && <span className="badge badge-danger">Gesperrt</span>}
                  {!u.email_confirmed_at && <span className="badge">E-Mail nicht bestätigt</span>}
                </div>
              </div>
              <div className="small account-facts">
                <span>Registriert: {date(u.created_at)}</span>
                <span>Zuletzt angemeldet: {date(u.last_sign_in_at)}</span>
                <span>Pferde: {horseCount.get(u.id) ?? 0}</span>
              </div>
              {!self && (
                <div className="row" style={{ marginTop: 10 }}>
                  {banned ? (
                    <form action={unbanUser.bind(null, u.id)}>
                      <button className="btn small secondary" type="submit">Sperre aufheben</button>
                    </form>
                  ) : (
                    <form action={banUser.bind(null, u.id)}>
                      <ConfirmButton className="btn small secondary" message={`${u.email} sperren? Anmelden ist dann nicht mehr möglich, die Pferde-Links werden ausgeschaltet.`}>
                        Sperren
                      </ConfirmButton>
                    </form>
                  )}
                  <form action={deleteUser.bind(null, u.id)}>
                    <ConfirmButton className="btn small danger" message={`${u.email} endgültig löschen? Alle Pferde und Dateien dieses Kontos werden gelöscht. Das lässt sich nicht rückgängig machen.`}>
                      Löschen
                    </ConfirmButton>
                  </form>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
