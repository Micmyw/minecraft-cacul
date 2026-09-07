"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { BrandMark, MenuIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";

const navigation = [
  { href: "/#calculator", label: "Calculator", className: "nav-calculator" },
  { href: "/minecraft-enchantments", label: "Enchantments" },
  { href: "/#guides", label: "Guides" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const isCurrentPage = (href: string) => {
    if (href === "/#calculator") return pathname === "/";
    if (href.includes("#")) return false;
    return pathname === href;
  };

  return (
    <header className="site-header">
      <div className="page-width header-inner">
        <Link
          className="brand"
          href="/"
          aria-label={`${siteConfig.name} – ${siteConfig.productName}`}
        >
          <span className="brand-mark" aria-hidden="true">
            <BrandMark size={38} />
          </span>
          <span className="brand-copy">
            <strong><span className="brand-name-anvil">Anvil</span><span className="brand-name-pilot">Pilot</span></strong>
            <small>Enchantment workbench</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className={"className" in item ? item.className : undefined}
              href={item.href}
              aria-current={isCurrentPage(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="mobile-nav-menu" ref={mobileMenuRef}>
          <summary aria-label="More navigation"><MenuIcon size={22} /></summary>
          <nav aria-label="Mobile navigation">
            {navigation.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrentPage(item.href) ? "page" : undefined}
                onClick={() => mobileMenuRef.current?.removeAttribute("open")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
