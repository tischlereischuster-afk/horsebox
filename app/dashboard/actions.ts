"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, BUCKET } from "@/lib/supabase/admin";
import { makeSlug } from "@/lib/slug";

function text(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
}
function int(fd: FormData, key: string) {
  const v = text(fd, key);
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : null;
}
function url(fd: FormData, key: string) {
  const v = text(fd, key);
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function horseFields(fd: FormData) {
  return {
    name: text(fd, "name") ?? "Unbenannt",
    birth_year: int(fd, "birth_year"),
    sex: text(fd, "sex"),
    color: text(fd, "color"),
    breed: text(fd, "breed"),
    height_cm: int(fd, "height_cm"),
    sire: text(fd, "sire"),
    dam: text(fd, "dam"),
    dam_sire: text(fd, "dam_sire"),
    description: text(fd, "description"),
    price_info: text(fd, "price_info"),
    rimondo_url: url(fd, "rimondo_url"),
    fn_url: url(fd, "fn_url"),
    is_public: fd.get("is_public") === "on",
  };
}

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function createHorse(fd: FormData) {
  const { supabase, user } = await requireUser();
  const fields = horseFields(fd);
  const { data, error } = await supabase
    .from("horses")
    .insert({ ...fields, owner_id: user.id, slug: makeSlug(fields.name) })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/dashboard/${data.id}?neu=1`);
}

export async function updateHorse(id: string, fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("horses").update(horseFields(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?gespeichert=1`);
}

export async function deleteHorse(id: string) {
  const { supabase } = await requireUser();
  // Erst prüfen, ob das Pferd dem Nutzer gehört (RLS lässt nur eigene Zeilen durch)
  const { data: media } = await supabase.from("media").select("storage_path").eq("horse_id", id);
  const { error } = await supabase.from("horses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const paths = (media ?? []).map((m) => m.storage_path);
  if (paths.length) await createAdminClient().storage.from(BUCKET).remove(paths);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveProfile(fd: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: text(fd, "display_name"),
    stable_name: text(fd, "stable_name"),
    location: text(fd, "location"),
    phone: text(fd, "phone"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect("/dashboard/profil?gespeichert=1");
}
