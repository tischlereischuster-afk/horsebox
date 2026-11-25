import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin-Client mit dem geheimen service_role Schlüssel.
 * NUR auf dem Server benutzen, und nur nachdem geprüft wurde, dass die Aktion erlaubt ist.
 * Wird gebraucht, um signierte Upload-/Download-Links für den privaten Speicher zu erstellen.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const BUCKET = "horse-media";
