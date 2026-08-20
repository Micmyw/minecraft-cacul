import Link from "next/link";
import { AnalyticsSettingsButton } from "@/components/site-analytics";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">{siteConfig.name}</Link>
          <p>Independent anvil planning for Minecraft {siteConfig.edition} {siteConfig.gameVersion}.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/minecraft-prior-work-penalty">Prior Work Penalty</Link>
          <Link href="/minecraft-anvil-too-expensive">Too Expensive</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/licenses">Licenses</Link>
          <AnalyticsSettingsButton />
          {siteConfig.contactEmail && <a href={`mailto:${siteConfig.contactEmail}`}>Contact</a>}
        </nav>
      </div>
      <div className="unofficial-notice">
        <div className="page-width">
          NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
        </div>
      </div>
    </footer>
  );
}
