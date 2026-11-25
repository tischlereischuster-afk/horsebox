import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Horse, Media, Profile } from "@/lib/types";

/** Lädt ein veröffentlichtes Pferd (ohne Login, über die öffentliche Leseregel). */
export const getPublicHorse = cache(async (slug: string) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data: horse } = await supabase
    .from("horses")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle<Horse>();
  if (!horse) return null;
  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("horse_id", horse.id)
    .order("sort_order")
    .order("created_at");
  const { data: seller } = await supabase
    .from("profiles")
    .select("id, display_name, stable_name, location, phone")
    .eq("id", horse.owner_id)
    .maybeSingle<Profile>();
  return { horse, media: (media ?? []) as Media[], seller };
});
