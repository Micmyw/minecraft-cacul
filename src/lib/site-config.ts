export const siteConfig = {
  name: "AnvilPilot",
  productName: "Minecraft Enchantment Calculator",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  edition: "Java Edition",
  gameVersion: "26.2",
} as const;
