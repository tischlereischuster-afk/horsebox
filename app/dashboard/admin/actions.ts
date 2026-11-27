"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient, BUCKET } from "@/lib/supabase/admin";

const PATH = "/dashboard/admin";

function checkNotSelf(adminId: string, userId: string) {
  if (adminId === userId) throw new Error("Das eigene Konto kann hier nicht gesperrt oder gelöscht werden.");
}

/** Konto sperren: Anmelden ist nicht mehr möglich, Pferdeseiten werden offline genommen. */
export async function banUser(userId: string) {
  const admin = await requireAdmin();
  checkNotSelf(admin.id, userId);
  const db = createAdminClient();
  const { error } = await db.auth.admin.updateUserById(userId, { ban_duration: "876000h" }); // ca. 100 Jahre
  if (error) throw new Error(error.message);
  await db.from("horses").update({ is_public: false }).eq("owner_id", userId);
  revalidatePath(PATH);
}

/** Sperre aufheben. Die Pferde-Links bleiben aus, der Nutzer kann sie selbst wieder einschalten. */
export async function unbanUser(userId: string) {
  await requireAdmin();
  const { error } = await createAdminClient().auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

/** Konto endgültig löschen, mit allen Pferden und hochgeladenen Dateien. */
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  checkNotSelf(admin.id, userId);
  const db = createAdminClient();
  const { data: horses } = await db.from("horses").select("id").eq("owner_id", userId);
  const ids = (horses ?? []).map((h) => h.id);
  if (ids.length) {
    const { data: media } = await db.from("media").select("storage_path").in("horse_id", ids);
    const paths = (media ?? []).map((m) => m.storage_path);
    for (let i = 0; i < paths.length; i += 500) await db.storage.from(BUCKET).remove(paths.slice(i, i + 500));
  }
  // Pferde, Medien-Einträge und Profil werden in der Datenbank automatisch mitgelöscht (on delete cascade)
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
