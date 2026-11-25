import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, BUCKET } from "@/lib/supabase/admin";
import { isMediaCategory } from "@/lib/types";
import { safeFileName } from "@/lib/slug";

/**
 * Schritt 1 beim Hochladen: Der Browser fragt hier nach einem einmaligen Upload-Link.
 * Die Datei selbst geht danach DIREKT vom Browser in den Speicher (nicht über unseren Server).
 * Das ist schnell und funktioniert auch mit großen Videos.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const horseId = String(body?.horseId ?? "");
  const category = body?.category;
  const fileName = String(body?.fileName ?? "");
  if (!horseId || !isMediaCategory(category) || !fileName) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  // Gehört das Pferd dem Nutzer? (RLS liefert nur eigene Pferde)
  const { data: horse } = await supabase
    .from("horses")
    .select("id")
    .eq("id", horseId)
    .eq("owner_id", auth.user.id)
    .maybeSingle();
  if (!horse) return NextResponse.json({ error: "Pferd nicht gefunden" }, { status: 404 });

  // Pfad im Speicher: <pferd>/<kategorie>/<zufall>/<dateiname>
  const path = `${horseId}/${category}/${crypto.randomUUID()}/${safeFileName(fileName)}`;
  const { data, error } = await createAdminClient().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Fehler" }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, path: data.path });
}
