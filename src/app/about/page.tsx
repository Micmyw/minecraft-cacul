import type { Metadata } from "next";
import Link from "next/link";
import {
  AnvilIcon,
  ArrowRightIcon,
  BrandMark,
  CheckIcon,
  CompassIcon,
  EnchantedBookIcon,
  GemIcon,
  InventoryCrateIcon,
  SparkIcon,
  ToolIcon,
} from "@/components/icons";
import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { formatIsoDate } from "@/lib/date-format";
import { secondaryPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = secondaryPageMetadata(
  "About AnvilPilot",
  "Learn how AnvilPilot calculates Minecraft Java Edition 26.2 anvil plans and labels exact and heuristic results.",
  "/about",
  true,
);

export default function AboutPage() {
  return (
    <article className="prose-page about-page page-width">
      <header className="about-hero">
        <div>
          <span className="section-kicker">ABOUT THE WORKBENCH</span>
          <h1>About AnvilPilot</h1>
          <p className="page-lede">
            {siteConfig.name} is an independent, browser-based work-order calculator
            for Minecraft {siteConfig.edition} {siteConfig.gameVersion} anvil combinations.
          </p>
          <Link className="hero-primary-action" href="/#calculator"><AnvilIcon size={21} />Open the calculator <ArrowRightIcon className="button-trailing-icon" size={18} /></Link>
        </div>
        <div className="about-brand-card" aria-hidden="true">
          <span className="about-brand-rune"><BrandMark size={154} /></span>
          <span>PLAN / COMBINE / PRESERVE</span>
        </div>
      </header>
      <dl className="about-facts">
        <div><dt>Ruleset</dt><dd>Java Edition {siteConfig.gameVersion}</dd></div>
        <div><dt>Coverage</dt><dd>{items.length} item groups</dd></div>
        <div><dt>Catalog</dt><dd>{enchantments.length} enchantments</dd></div>
        <div><dt>Privacy</dt><dd>Runs locally</dd></div>
      </dl>
      <section className="about-capabilities" aria-labelledby="about-capabilities-title">
        <div className="about-section-heading">
          <div><span className="section-kicker">CAPABILITY LEDGER</span><h2 id="about-capabilities-title">What AnvilPilot does</h2></div>
          <p>Two planning workflows feed the same versioned rule engine, then return a clearly labeled, slot-by-slot work order.</p>
        </div>
        <div className="capability-grid">
          <article className="capability-card tone-emerald">
            <span className="capability-icon"><SparkIcon size={28} /></span>
            <h3>Quick Plan</h3>
            <p>Choose an item and wanted enchantments. The planner assumes fresh, single-enchantment books.</p>
          </article>
          <article className="capability-card tone-amethyst">
            <span className="capability-icon"><InventoryCrateIcon size={30} /></span>
            <h3>Inventory Plan</h3>
            <p>Enter existing gear, mixed books, and the real prior-work count carried by every material.</p>
          </article>
          <article className="capability-card tone-emerald">
            <span className="capability-icon"><CheckIcon size={27} /></span>
            <h3>Exact Optimal</h3>
            <p>For up to eight sacrifices, a complete search proves no plan ranks better under the chosen objective.</p>
          </article>
          <article className="capability-card tone-cyan">
            <span className="capability-icon"><GemIcon size={29} /></span>
            <h3>Best Found</h3>
            <p>For nine to 32 sacrifices, a deterministic bounded search returns its best result without claiming proof.</p>
          </article>
          <article className="capability-card tone-amber">
            <span className="capability-icon"><ToolIcon size={30} /></span>
            <h3>Java Edition {siteConfig.gameVersion}</h3>
            <p>Compatibility, transfer costs, prior work, and the 40-level Survival rule use one verified ruleset.</p>
          </article>
          <article className="capability-card tone-cyan">
            <span className="capability-icon"><CompassIcon size={29} /></span>
            <h3>Local calculation</h3>
            <p>The solver runs in your browser. Plans are not uploaded to an AnvilPilot server.</p>
          </article>
          <article className="capability-card tone-emerald">
            <span className="capability-icon"><AnvilIcon size={30} /></span>
            <h3>Work-order output</h3>
            <p>Every step names the left slot, right slot, level cost, result, and prior work you need to follow.</p>
          </article>
          <article className="capability-card tone-amethyst">
            <span className="capability-icon"><EnchantedBookIcon size={30} /></span>
            <h3>Guides</h3>
            <p>Use the enchantment catalog and mechanic guides to understand conflicts, costs, and Too Expensive.</p>
          </article>
        </div>
      </section>
      <div className="about-evidence-grid">
        <section>
          <span className="story-index">SOURCE / VERSION</span>
          <h2>Sources and version</h2>
          <p>
            The current data was verified on {formatIsoDate(dataMetadata.verifiedAt)} for Java Edition
            {" "}{dataMetadata.gameVersion}. The solver&apos;s exhaustive merge-tree approach
            references the MIT-licensed iamcal/enchant-order project at commit{" "}
            <code>{dataMetadata.upstreamCommit}</code>. See the <Link href="/licenses">license page</Link> for attribution.
          </p>
        </section>
        <section>
          <span className="story-index">INDEPENDENT TOOL</span>
          <h2>Independence</h2>
          <p>
            AnvilPilot is not an official Minecraft product and is not approved by or
            associated with Mojang or Microsoft. Minecraft is used only to identify the
            game whose publicly observable mechanics this tool models.
          </p>
        </section>
      </div>
    </article>
  );
}
