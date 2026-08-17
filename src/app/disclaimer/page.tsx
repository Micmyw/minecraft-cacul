import type { Metadata } from "next";
import { secondaryPageMetadata } from "@/lib/seo";

export const metadata: Metadata = secondaryPageMetadata(
  "Disclaimer",
  "Trademark, affiliation, and calculation disclaimers for AnvilPilot.",
  "/disclaimer",
);

export default function DisclaimerPage() {
  return (
    <article className="prose-page page-width">
      <span className="section-kicker">LEGAL / DISCLAIMER</span>
      <h1>Disclaimer</h1>
      <p className="page-lede">AnvilPilot is an independent fan-made utility.</p>
      <h2>No official affiliation</h2>
      <p>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</p>
      <h2>Trademarks</h2>
      <p>Minecraft, Mojang, Microsoft, and related names are the property of their respective owners. Their names are used only to describe compatibility and scope.</p>
      <h2>Calculation scope</h2>
      <p>Results model the supported Java Edition 26.2 rules and inputs shown on the calculator. Bedrock Edition, snapshots, mods, datapacks, repairs, renaming, and durability calculations are outside this version&apos;s scope.</p>
    </article>
  );
}
