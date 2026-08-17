import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} – ${siteConfig.productName}`,
    short_name: siteConfig.name,
    description: "Plan lower-cost Minecraft Java Edition anvil orders with shareable steps.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F0E",
    theme_color: "#151B18",
    icons: [
      {
        src: "/icons/anvil-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
