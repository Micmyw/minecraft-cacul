import type { Metadata } from "next";
import Link from "next/link";
import { dataMetadata } from "@/data/java/26.2/metadata";
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
    <article className="prose-page page-width">
      <span className="section-kicker">ABOUT THE WORKBENCH</span>
      <h1>About AnvilPilot</h1>
      <p className="page-lede">
        {siteConfig.name} is an independent, browser-based work-order calculator
        for Minecraft {siteConfig.edition} {siteConfig.gameVersion} anvil combinations.
      </p>
      <h2>What it calculates</h2>
      <p>
        The calculator models enchantment transfer costs, compatibility, prior-work
        penalties and enchanted-book combinations. Every
        recommended step names the left slot, right slot, cost, and result.
      </p>
      <h2>How result quality is labeled</h2>
      <p>
        Plans with no more than eight sacrifices use a complete search and may be
        labeled Exact Optimal. Larger plans use a deterministic bounded search and
        are labeled Best Found. That label is never presented as proof of the
        cheapest possible order.
      </p>
      <h2>Sources and version</h2>
      <p>
        The current data was verified on {dataMetadata.verifiedAt} for Java Edition
        {" "}{dataMetadata.gameVersion}. The solver&apos;s exhaustive merge-tree approach
        references the MIT-licensed iamcal/enchant-order project at commit{" "}
        <code>{dataMetadata.upstreamCommit}</code>. See the <Link href="/licenses">license page</Link> for attribution.
      </p>
      <h2>Independence</h2>
      <p>
        AnvilPilot is not an official Minecraft product and is not approved by or
        associated with Mojang or Microsoft. Minecraft is used only to identify the
        game whose publicly observable mechanics this tool models.
      </p>
      <p><Link className="inline-link" href="/#calculator">Open the enchantment calculator</Link></p>
    </article>
  );
}
