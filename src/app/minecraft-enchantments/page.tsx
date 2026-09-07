import type { Metadata } from "next";
import Link from "next/link";
import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { EnchantmentExplorer } from "@/features/reference/enchantment-explorer";
import { LoadoutLibrary } from "@/features/reference/loadout-library";
import { secondaryPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const title = "Minecraft Enchantments List – Items, Levels & Conflicts";
const description =
  "Search all 43 Minecraft Java 26.2 enchantments by item, max level, anvil book cost, availability, and incompatible enchantments.";
const pathname = "/minecraft-enchantments";

export const metadata: Metadata = {
  ...secondaryPageMetadata(title, description, pathname, true),
  title: { absolute: title },
  openGraph: {
    type: "website",
    url: pathname,
    siteName: siteConfig.name,
    title,
    description,
    images: [{ url: "/opengraph-image", alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Minecraft Java 26.2 enchantments",
  numberOfItems: enchantments.length,
  itemListElement: enchantments.map((enchantment, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: enchantment.name,
    url: `${siteConfig.url}${pathname}#${enchantment.id}`,
  })),
};

export default function EnchantmentReferencePage() {
  return (
    <article className="reference-page page-width">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema).replaceAll("<", "\\u003c"),
        }}
      />
      <header className="reference-header">
        <div>
          <span className="section-kicker">JAVA 26.2 / FIELD REFERENCE</span>
          <h1>Minecraft Enchantments Reference</h1>
          <p className="page-lede">
            Browse the complete current Java catalog, compare book costs and
            availability, check conflicts, or load a verified build into the anvil
            calculator.
          </p>
        </div>
        <dl className="reference-stats">
          <div><dt>Catalog</dt><dd>{enchantments.length} enchantments</dd></div>
          <div><dt>Coverage</dt><dd>{items.length} item groups</dd></div>
          <div><dt>Ruleset</dt><dd>Data pack {dataMetadata.dataPackVersion}</dd></div>
        </dl>
      </header>

      <aside className="source-strip" aria-label="Catalog verification">
        <div>
          <span>OFFICIAL DATA CHECK</span>
          <strong>Verified September 7, 2026</strong>
        </div>
        <p>
          IDs, max levels, costs, item tags, availability tags, and exclusive sets
          were checked against Mojang&apos;s signed 26.2 client data. Java 26.2 remains
          the latest stable release; snapshots are not mixed into this catalog.
        </p>
        <a href={dataMetadata.versionMetadataUrl}>View Mojang version metadata</a>
      </aside>

      <LoadoutLibrary />
      <EnchantmentExplorer />

      <section className="reference-notes" aria-labelledby="reference-notes-title">
        <div>
          <span className="section-kicker">READ THE LEDGER</span>
          <h2 id="reference-notes-title">What the numbers mean</h2>
        </div>
        <div className="reference-note-grid">
          <article>
            <h3>Book cost</h3>
            <p>
              When a book transfers an enchantment, its listed multiplier is applied
              to the resulting enchantment level. Prior-work penalties from both slots
              are added separately.
            </p>
          </article>
          <article>
            <h3>Enchanting weight</h3>
            <p>
              Weight affects random selection at an enchanting table. It is not an
              anvil price and does not change AnvilPilot&apos;s optimization ranking.
            </p>
          </article>
          <article>
            <h3>Tradeable tag</h3>
            <p>
              This follows the official Java data tag. Actual access can still depend
              on world settings, structures, trades, loot, and the current game mode.
            </p>
          </article>
        </div>
      </section>

      <section className="reference-faq" aria-labelledby="reference-faq-title">
        <span className="section-kicker">CATALOG QUESTIONS</span>
        <h2 id="reference-faq-title">Enchantment FAQ</h2>
        <div className="faq-list guide-faq">
          <details>
            <summary>Why are there 26 item groups instead of every material variant?</summary>
            <p>Items with identical enchantment rules are grouped together. Sword covers the material variants that use the same Java enchantment compatibility.</p>
          </details>
          <details>
            <summary>Does Treasure mean the enchantment is always tradeable?</summary>
            <p>No. Treasure, tradeable, and enchanting-table availability are separate official tags and are displayed separately.</p>
          </details>
          <details>
            <summary>Can incompatible enchantments be combined in Survival?</summary>
            <p>Not on the same target through normal anvil rules. The calculator disables conflicting Quick Plan choices and validates real Inventory inputs.</p>
          </details>
          <details>
            <summary>Is the 26.3 pre-release included?</summary>
            <p>No. AnvilPilot keeps prerelease and snapshot data out of the stable 26.2 ruleset until a new release is verified.</p>
          </details>
        </div>
      </section>

      <nav className="reference-links" aria-label="Continue from the enchantment reference">
        <Link href="/#calculator">Open the anvil calculator</Link>
        <Link href="/minecraft-prior-work-penalty">Learn prior-work penalties</Link>
        <Link href="/minecraft-anvil-too-expensive">Fix Too Expensive plans</Link>
      </nav>
    </article>
  );
}
