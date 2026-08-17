import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.url.replace(/\/$/u, ""), lastModified: new Date("2026-08-17") }];
}
