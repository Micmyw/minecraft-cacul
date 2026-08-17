import type { Metadata } from "next";
import { Archivo_Narrow, Atkinson_Hyperlegible } from "next/font/google";
import { SiteAnalytics } from "@/components/site-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const displayFont = Archivo_Narrow({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.productName, template: `%s | ${siteConfig.name}` },
  description: "Plan Minecraft Java Edition anvil combinations with clear costs and shareable steps.",
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/anvil-mark.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.productName,
    description: "Plan Minecraft Java Edition anvil combinations with clear costs and shareable steps.",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.productName,
    description: "Plan Minecraft Java Edition anvil combinations with clear costs and shareable steps.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <SiteAnalytics />
      </body>
    </html>
  );
}
