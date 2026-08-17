const canonicalSiteUrl = "https://enchantmentcalculator.com";

export const siteConfig = {
  name: "AnvilPilot",
  productName: "Minecraft Enchantment Calculator",
  url: canonicalSiteUrl,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  productVersion: "1.0.0",
  edition: "Java Edition",
  gameVersion: "26.2",
} as const;
