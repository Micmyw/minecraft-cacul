import type { Metadata } from "next";
import { secondaryPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = secondaryPageMetadata(
  "Privacy",
  "How AnvilPilot stores calculator inputs locally in your browser.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <article className="prose-page page-width">
      <span className="section-kicker">LEGAL / PRIVACY</span>
      <h1>Privacy</h1>
      <p className="page-lede">AnvilPilot performs its calculations in your browser and does not require an account.</p>
      <h2>Information stored on your device</h2>
      <p>The site uses LocalStorage to remember your latest plan, planner mode, and optimization mode. Clear Saved Plan removes that saved browser entry.</p>
      <h2>Share links</h2>
      <p>A share link encodes calculator inputs in the URL hash. The hash is not sent as part of normal HTTP requests, but anyone you share the full URL with can read and restore that plan.</p>
      <h2>Analytics and personal information</h2>
      <p>This version does not include analytics, advertising, user accounts, or a database. Do not put personal information into ingredient IDs or any future free-text fields.</p>
      <h2>Contact</h2>
      {siteConfig.contactEmail ? <p>Privacy questions can be sent to <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</p> : <p>A public contact address will be added before production launch.</p>}
    </article>
  );
}
