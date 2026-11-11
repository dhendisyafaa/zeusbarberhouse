import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f5ecdc",
    theme_color: "#09090b",
    lang: siteConfig.language,
    categories: ["beauty", "lifestyle"],
    icons: [
      {
        src: siteConfig.logo,
        sizes: "any",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
