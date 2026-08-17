import type { Metadata } from "next";
import { secondaryPageMetadata } from "@/lib/seo";

export const metadata: Metadata = secondaryPageMetadata(
  "Terms",
  "Terms for using the independent AnvilPilot enchantment planning tool.",
  "/terms",
);

export default function TermsPage() {
  return (
    <article className="prose-page page-width">
      <span className="section-kicker">LEGAL / TERMS</span>
      <h1>Terms of Use</h1>
      <p className="page-lede">Use AnvilPilot as an informational planning aid.</p>
      <h2>No guarantee of game outcomes</h2>
      <p>Game mechanics can change. Check that the selected edition and version match the world you are playing before spending items or levels.</p>
      <h2>Result quality</h2>
      <p>Exact Optimal is reserved for completed exhaustive searches within the published eight-material boundary. Best Found is a heuristic result and is not guaranteed to be the cheapest possible plan.</p>
      <h2>Acceptable use</h2>
      <p>You may use and share plans for ordinary personal or community gameplay. Do not attempt to interfere with the site, distribute malicious links, or misrepresent AnvilPilot as an official Minecraft service.</p>
      <h2>Availability</h2>
      <p>The site is provided as available without warranties. Features, supported versions, and these terms may change when the tool is updated.</p>
    </article>
  );
}
