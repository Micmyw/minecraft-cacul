import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { secondaryPageMetadata } from "@/lib/seo";

export const metadata: Metadata = secondaryPageMetadata(
  "Open Source Licenses",
  "Third-party attribution and MIT license text used by AnvilPilot.",
  "/licenses",
);

export default async function LicensesPage() {
  const license = await readFile(
    path.join(process.cwd(), "licenses", "iamcal-enchant-order-MIT.txt"),
    "utf8",
  );
  return (
    <article className="prose-page page-width">
      <span className="section-kicker">LEGAL / OPEN SOURCE</span>
      <h1>Open Source Licenses</h1>
      <p className="page-lede">AnvilPilot acknowledges the open-source work used as a reference.</p>
      <h2>iamcal/enchant-order</h2>
      <p>Reference commit: <code>380c9f8639e48c6b1a668b68b6f3228753fe00fe</code></p>
      <pre className="license-text">{license}</pre>
    </article>
  );
}
