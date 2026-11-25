import { design } from "@/lib/design";
import type { MetadataRoute } from "next";

// Grundlage für eine spätere "App zum Installieren" (PWA) auf dem Handy-Homescreen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Horsebox",
    short_name: "Horsebox",
    start_url: "/dashboard",
    display: "standalone",
    background_color: design().background,
    theme_color: design().themeColor,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
