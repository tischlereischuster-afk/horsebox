"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "signup" && !data.session) {
      return setMsg("Fast fertig: Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.");
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 32 }}>🐴 Horsebox</h1>
      <div className="card">
        <h2>{mode === "login" ? "Anmelden" : "Konto anlegen"}</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label htmlFor="email">E-Mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw">Passwort</label>
            <input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" disabled={busy}>{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Registrieren"}</button>
          {msg && <p className="small">{msg}</p>}
        </form>
        <p className="small muted" style={{ marginTop: 12 }}>
          {mode === "login" ? "Noch kein Konto? " : "Schon registriert? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "signup" : "login"); }}>
            {mode === "login" ? "Jetzt registrieren" : "Anmelden"}
          </a>
        </p>
      </div>
    </main>
  );
}
