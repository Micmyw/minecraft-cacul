"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  const isGuidePage = pathname === "/minecraft-prior-work-penalty"
    || pathname === "/minecraft-anvil-too-expensive";

  return (
    <header className="site-header">
      <div className="page-width header-inner">
        <Link
          className="brand"
          href="/"
          aria-label={`${siteConfig.name} – ${siteConfig.productName}`}
        >
          <span className="brand-mark" aria-hidden="true">
            <Image
              src="/images/anvilpilot-forge-mark.webp"
              alt=""
              width={44}
              height={44}
              sizes="44px"
              loading="eager"
              fetchPriority="high"
            />
          </span>
          <span className="brand-copy">
            <strong>{siteConfig.name}</strong>
            <small>Enchantment workbench</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link
            className="nav-calculator"
            href="/#calculator"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Calculator
          </Link>
          <Link
            href="/minecraft-enchantments"
            aria-current={pathname === "/minecraft-enchantments" ? "page" : undefined}
          >
            Enchantments
          </Link>
          <Link href="/#guides" aria-current={isGuidePage ? "page" : undefined}>Guides</Link>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
        </nav>
        <details className="mobile-nav-menu">
          <summary aria-label="More navigation"><span aria-hidden="true">☰</span></summary>
          <nav aria-label="Mobile navigation">
            <Link
              href="/minecraft-enchantments"
              aria-current={pathname === "/minecraft-enchantments" ? "page" : undefined}
            >
              Enchantments
            </Link>
            <Link href="/#guides" aria-current={isGuidePage ? "page" : undefined}>Guides</Link>
            <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
