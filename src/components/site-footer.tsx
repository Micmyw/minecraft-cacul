import Link from "next/link";
import { BrandMark } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={40} />
            </span>
            <span className="brand-copy"><strong><span className="brand-name-anvil">Anvil</span><span className="brand-name-pilot">Pilot</span></strong><small>Enchantment workbench</small></span>
          </Link>
          <p>Independent anvil planning for Minecraft {siteConfig.edition} {siteConfig.gameVersion}.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/minecraft-enchantments">Enchantments</Link>
          <Link href="/minecraft-prior-work-penalty">Prior Work Penalty</Link>
          <Link href="/minecraft-anvil-too-expensive">Too Expensive</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/licenses">Licenses</Link>
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
