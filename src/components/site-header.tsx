import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-width header-inner">
        <Link className="brand" href="/" aria-label={`${siteConfig.name} home`}>
          <svg viewBox="0 0 42 42" aria-hidden="true">
            <path d="M5 10h32v8l-7 5h-5v6h7v6H10v-6h7v-6h-5l-7-5z" />
          </svg>
          <span>{siteConfig.name}</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#calculator">Calculator</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
