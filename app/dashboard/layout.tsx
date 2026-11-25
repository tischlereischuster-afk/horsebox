import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="topbar">
        <Link href="/dashboard">🐴 Meine Pferde</Link>
        <div className="row">
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
