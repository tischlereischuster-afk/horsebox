import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase-Client für Server-Seiten. Arbeitet im Namen des eingeloggten Nutzers (oder anonym). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // In Server Components dürfen keine Cookies gesetzt werden. Das übernimmt proxy.ts.
          }
        },
      },
    },
  );
}
