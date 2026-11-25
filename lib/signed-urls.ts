import "server-only";
import { createAdminClient, BUCKET } from "@/lib/supabase/admin";
import type { Media } from "@/lib/types";

export type MediaWithUrls = Media & { viewUrl: string | null; downloadUrl: string | null };

/**
 * Erstellt für jede Datei zwei zeitlich begrenzte Links:
 *  - viewUrl: zum Anschauen im Browser (Video abspielen, Foto zeigen)
 *  - downloadUrl: erzwingt den Download mit dem Dateinamen
 * Links gelten 6 Stunden. Lädt der Kunde die Seite neu, bekommt er frische Links.
 */
export async function withSignedUrls(media: Media[], expiresIn = 60 * 60 * 6): Promise<MediaWithUrls[]> {
  if (media.length === 0) return [];
  const storage = createAdminClient().storage.from(BUCKET);
  const paths = media.map((m) => m.storage_path);
  const [view, download] = await Promise.all([
    storage.createSignedUrls(paths, expiresIn),
    storage.createSignedUrls(paths, expiresIn, { download: true }),
  ]);
  const byPath = (list: { path: string | null; signedUrl: string | null }[] | null) =>
    new Map((list ?? []).map((x) => [x.path, x.signedUrl]));
  const v = byPath(view.data);
  const d = byPath(download.data);
  return media.map((m) => ({
    ...m,
    viewUrl: v.get(m.storage_path) ?? null,
    downloadUrl: d.get(m.storage_path) ?? null,
  }));
}
