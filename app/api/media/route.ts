import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, BUCKET } from "@/lib/supabase/admin";
import { isMediaCategory } from "@/lib/types";

/** Schritt 2 beim Hochladen: Nach erfolgreichem Upload wird die Datei beim Pferd eingetragen. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const horseId = String(body?.horseId ?? "");
  const path = String(body?.path ?? "");
  if (!horseId || !isMediaCategory(body?.category) || !path.startsWith(`${horseId}/${body.category}/`)) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      horse_id: horseId,
      category: body.category,
      file_name: String(body.fileName ?? path.split("/").pop()),
      storage_path: path,
      mime_type: body.mimeType ? String(body.mimeType) : null,
      size_bytes: Number.isFinite(body.size) ? body.size : null,
    })
    .select("id")
    .single();
  // RLS verhindert, dass jemand Dateien an fremde Pferde hängt
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

/** Datei löschen: /api/media?id=... */
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id") ?? "";
  // Über RLS: nur eigene Dateien werden gefunden und gelöscht
  const { data: media } = await supabase
    .from("media")
    .select("id, storage_path, horses!inner(owner_id)")
    .eq("id", id)
    .eq("horses.owner_id", auth.user.id)
    .maybeSingle();
  if (!media) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await createAdminClient().storage.from(BUCKET).remove([media.storage_path]);
  return NextResponse.json({ ok: true });
}

/**
 * Reihenfolge ändern: PATCH /api/media  { id, action: "up" | "down" | "first" }
 * "first" bei Fotos = Titelbild (das erste Foto wird auf der Kundenseite und in der WhatsApp-Vorschau groß gezeigt).
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  const action = body?.action;
  if (!id || !["up", "down", "first"].includes(action)) return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });

  // RLS: nur eigene Dateien sind sichtbar
  const { data: item } = await supabase.from("media").select("horse_id, category").eq("id", id).maybeSingle();
  if (!item) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const { data: list } = await supabase
    .from("media")
    .select("id")
    .eq("horse_id", item.horse_id)
    .eq("category", item.category)
    .order("sort_order")
    .order("created_at");
  const ids = (list ?? []).map((m) => m.id as string);
  const i = ids.indexOf(id);
  if (action === "first") ids.unshift(...ids.splice(i, 1));
  else {
    const j = action === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return NextResponse.json({ ok: true });
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const results = await Promise.all(ids.map((mid, idx) => supabase.from("media").update({ sort_order: idx }).eq("id", mid)));
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
