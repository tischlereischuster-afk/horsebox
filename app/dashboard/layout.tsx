import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data } = await (await createClient()).auth.getUser();
  const admin = isAdminEmail(data.user?.email);
  return (
    <>
      <div className="topbar">
        <Link className="btn small secondary" href="/dashboard">🐴 Meine Pferde</Link>
        <div className="row">
          {admin && <Link className="btn small secondary" href="/dashboard/admin">Konten</Link>}
          <Link className="btn small secondary" href="/dashboard#einladen">Einladen</Link>
          <Link className="btn small secondary" href="/dashboard/profil">Mein Profil</Link>
          <form action="/auth/signout" method="post">
            <button className="btn small secondary" type="submit">Abmelden</button>
          </form>
        </div>
      </div>
      <main className="container">{children}</main>
    </>
  );
}
