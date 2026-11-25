import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/slug";
import { currentDesign, design } from "@/lib/design";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Horsebox", template: "%s · Horsebox" },
  description: "Alle Infos, Videos, Fotos und Röntgenbilder eines Pferdes an einem Ort, mit einem Link teilbar.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: design().themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" data-design={currentDesign()}>
      <body>{children}</body>
    </html>
  );
}
