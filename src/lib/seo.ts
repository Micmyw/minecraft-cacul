import type { Metadata } from "next";
import { siteConfig } from "./site-config";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${siteConfig.url.replace(/\/$/u, "")}/`).toString();
}

export function secondaryPageMetadata(
  title: string,
  description: string,
  pathname: string,
  index = false,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
    robots: { index, follow: true },
  };
}
