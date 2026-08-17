import type { Metadata } from "next";
import { CalculatorShell } from "@/features/planner/calculator-shell";
import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Minecraft Enchantment Calculator – Best Anvil Order",
  description:
    "Find the cheapest Minecraft anvil order, compare XP costs, and avoid Too Expensive. Free Java Edition enchantment planner with shareable steps.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.productName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  description: metadata.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any operating system with a modern web browser",
  browserRequirements: "Requires JavaScript and Web Worker support",
  softwareVersion: siteConfig.gameVersion,
  isAccessibleForFree: true,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(applicationSchema).replaceAll("<", "\\u003c"),
        }}
      />
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow"><span>ANVIL WORK ORDER</span><span>JAVA {siteConfig.gameVersion}</span></div>
          <h1>Minecraft Enchantment Calculator</h1>
          <p className="hero-lede">
            Find a low-cost anvil order, see every left and right slot, and catch
            Too Expensive steps before you spend levels in Survival.
          </p>
          <div className="hero-proof">
            <span>{items.length} item types</span>
            <span>{enchantments.length} enchantments</span>
            <span>Verified {dataMetadata.verifiedAt}</span>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <svg viewBox="0 0 260 180">
            <path className="hero-mark-outline" d="M30 36h200v44l-48 28h-27v25h46v25H59v-25h46v-25H78L30 80z" />
            <path className="hero-mark-line" d="M50 57h160M130 20v137" />
          </svg>
          <span>PLAN / COMBINE / PRESERVE</span>
        </div>
      </section>

      <section id="calculator" className="calculator-section page-width" aria-labelledby="calculator-heading">
        <div className="tool-intro">
          <div><span className="section-kicker">LOCAL CALCULATION</span><h2 id="calculator-heading">Build your anvil plan</h2></div>
          <p>Use Quick Plan for fresh books, or enter the prior work and enchantments on the items you already own.</p>
        </div>
        <CalculatorShell />
      </section>

      <div className="content-sections page-width">
        <section>
          <span className="section-kicker">COST LOGIC</span>
          <h2>Why Enchantment Order Matters</h2>
          <p>
            Every anvil use adds a prior-work penalty. Combining the same books in a
            different tree can change both the total levels you spend and the cost of
            the final step. A step costing 40 levels or more cannot be completed in
            Survival, even when the enchantments themselves are valid.
          </p>
        </section>
        <section>
          <span className="section-kicker">THREE MOVES</span>
          <h2>How to Use the Calculator</h2>
          <ol className="how-list">
            <li><span>1</span><div><strong>Choose the item</strong><p>Select a functional item type such as Sword, Pickaxe, Mace, or Spear.</p></div></li>
            <li><span>2</span><div><strong>Describe your materials</strong><p>Use fresh books in Quick Plan, or enter real prior work and mixed books in Inventory Plan.</p></div></li>
            <li><span>3</span><div><strong>Follow the slots</strong><p>Run the solver, then use the listed left slot, right slot, cost, and result for every step.</p></div></li>
          </ol>
        </section>
        <section className="quality-explainer">
          <span className="section-kicker">RESULT QUALITY</span>
          <h2>Exact Optimal vs Best Found</h2>
          <div className="explainer-grid">
            <article><strong>Exact Optimal</strong><p>With up to eight sacrifices, AnvilPilot completes the full search and proves that no plan ranks better under the selected objective and tie-breakers.</p></article>
            <article><strong>Best Found</strong><p>With nine to 32 sacrifices, a deterministic bounded search returns its best result without claiming mathematical optimality.</p></article>
          </div>
        </section>
        <section>
          <span className="section-kicker">SUPPORTED RULESET</span>
          <h2>Java Edition Scope</h2>
          <p>
            This version supports Minecraft Java Edition 26.2 enchantment costs,
            compatibility, prior work, enchanted books, and same-type sacrifice
            items. It does not calculate Bedrock rules, renaming, material repairs,
            durability merging, mods, datapacks, or snapshots.
          </p>
        </section>
        <section>
          <span className="section-kicker">COMMON QUESTIONS</span>
          <h2>FAQ</h2>
          <div className="faq-list">
            <details><summary>What does prior work mean?</summary><p>Prior work is the number of earlier anvil operations in an item&apos;s history. The penalty follows 2ⁿ − 1, so it grows quickly.</p></details>
            <details><summary>Why can a valid enchantment plan still be Too Expensive?</summary><p>Survival blocks any single anvil step at 40 levels or more. Earlier combinations can raise the final item&apos;s prior-work penalty past that limit.</p></details>
            <details><summary>Can I share a calculation?</summary><p>Yes. Copy Share Link stores the validated input in the URL hash. It does not create a server record and the hash is not part of the canonical URL.</p></details>
            <details><summary>Does a mixed book keep every enchantment?</summary><p>No. When a book is applied to an item, enchantments that do not apply to that item are discarded and shown as a warning.</p></details>
          </div>
        </section>
        <aside className="scope-note">
          <strong>Independent tool</strong>
          <p>AnvilPilot is an unofficial planning aid and is not approved by or associated with Mojang or Microsoft.</p>
        </aside>
      </div>
    </>
  );
}
