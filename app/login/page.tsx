"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

function translate(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-Mail oder Passwort stimmt nicht.";
  if (/email not confirmed/i.test(msg)) return "Bitte bestätige zuerst deine E-Mail-Adresse (Link im Postfach).";
  if (/already registered/i.test(msg)) return "Diese E-Mail ist schon registriert. Bitte anmelden.";
  if (/at least/i.test(msg)) return "Das Passwort muss mindestens 8 Zeichen haben.";
  return msg;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup");
  }, []);

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
    if (error) return setMsg({ text: translate(error.message), err: true });
    if (mode === "signup" && !data.session) {
      return setMsg({ text: "Fast fertig: Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.", err: false });
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-wrap">
      <Link href="/" className="auth-logo" style={{ textDecoration: "none" }}>
        <span className="icon">🐴</span>
        <h1>Horsebox</h1>
        <p>Verkaufspferde einfach per Link teilen</p>
      </Link>

      <div className="auth-card">
        <div className="auth-tabs" role="tablist">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMsg(null); }}>Anmelden</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMsg(null); }}>Registrieren</button>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <div>
            <label htmlFor="email">E-Mail</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" />
          </div>
          <div>
            <label htmlFor="pw">Passwort</label>
            <div className="pw-field">
              <input
                id="pw"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "mindestens 8 Zeichen" : ""}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}>
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>
          <button className="btn" disabled={busy}>{busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Konto anlegen"}</button>
          {msg && <p className={"auth-msg" + (msg.err ? " err" : "")}>{msg.text}</p>}
        </form>
      </div>
    </main>
  );
}
