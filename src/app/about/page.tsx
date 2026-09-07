import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
          <Link className="hero-primary-action" href="/#calculator">Open the calculator <span aria-hidden="true">→</span></Link>
        </div>
        <div className="about-brand-card" aria-hidden="true">
          <Image
            src="/images/anvilpilot-forge-mark.webp"
            alt=""
            width={320}
            height={320}
            sizes="(max-width: 700px) 220px, 300px"
            loading="eager"
            fetchPriority="high"
          />
          <span>PLAN / COMBINE / PRESERVE</span>
        </div>
      </header>
      <dl className="about-facts">
        <div><dt>Ruleset</dt><dd>Java Edition {siteConfig.gameVersion}</dd></div>
        <div><dt>Coverage</dt><dd>{items.length} item groups</dd></div>
        <div><dt>Catalog</dt><dd>{enchantments.length} enchantments</dd></div>
        <div><dt>Privacy</dt><dd>Runs locally</dd></div>
      </dl>
      <div className="about-story-grid">
        <section>
          <span className="story-index">01 / THE MODEL</span>
          <h2>What it calculates</h2>
          <p>
            The calculator models enchantment transfer costs, compatibility, prior-work
            penalties and enchanted-book combinations. Every recommended step names
            the left slot, right slot, cost, and result.
          </p>
        </section>
        <section>
          <span className="story-index">02 / RESULT QUALITY</span>
          <h2>How result quality is labeled</h2>
          <p>
            Plans with no more than eight sacrifices use a complete search and may be
            labeled Exact Optimal. Larger plans use a deterministic bounded search and
            are labeled Best Found. That label is never presented as proof of the
            cheapest possible order.
          </p>
        </section>
        <section>
          <span className="story-index">03 / VERIFICATION</span>
          <h2>Sources and version</h2>
          <p>
            The current data was verified on {formatIsoDate(dataMetadata.verifiedAt)} for Java Edition
            {" "}{dataMetadata.gameVersion}. The solver&apos;s exhaustive merge-tree approach
            references the MIT-licensed iamcal/enchant-order project at commit{" "}
            <code>{dataMetadata.upstreamCommit}</code>. See the <Link href="/licenses">license page</Link> for attribution.
          </p>
        </section>
        <section>
          <span className="story-index">04 / INDEPENDENCE</span>
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
