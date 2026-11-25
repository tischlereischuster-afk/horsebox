"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Supabase-Client für den Browser (Login-Formular). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
