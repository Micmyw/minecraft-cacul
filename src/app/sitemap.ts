import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const contentLastModified = new Date("2026-08-17T00:00:00.000Z");
const guideLastModified = new Date("2026-08-20T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url.replace(/\/$/u, ""),
      lastModified: contentLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: contentLastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/minecraft-prior-work-penalty"),
      lastModified: guideLastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/minecraft-anvil-too-expensive"),
      lastModified: guideLastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
