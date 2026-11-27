import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Wer darf die Kontenverwaltung sehen? Die E-Mail-Adressen stehen in der
 * Umgebungsvariable ADMIN_EMAILS (in Vercel eintragen, mehrere mit Komma trennen).
 */
export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** Bricht ab (Weiterleitung), wenn der eingeloggte Nutzer kein Admin ist. */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  if (!isAdminEmail(data.user.email)) redirect("/dashboard");
  return data.user;
}
