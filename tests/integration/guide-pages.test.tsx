import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TooExpensivePage, {
  metadata as tooExpensiveMetadata,
} from "@/app/minecraft-anvil-too-expensive/page";
import PriorWorkPage, {
  metadata as priorWorkMetadata,
} from "@/app/minecraft-prior-work-penalty/page";
import { metadata as homeMetadata } from "@/app/page";
import sitemap from "@/app/sitemap";
import { SiteFooter } from "@/components/site-footer";

afterEach(() => cleanup());

describe("guide page SEO and content contracts", () => {
  it("renders the complete Prior Work Penalty guide contract", () => {
    expect(priorWorkMetadata).toMatchObject({
      title: { absolute: "Minecraft Prior Work Penalty – Anvil Cost Table" },
      description:
        "Learn how Minecraft Java Edition prior work increases anvil costs, use the 2^n − 1 penalty table, and plan a cheaper enchantment order.",
      alternates: { canonical: "/minecraft-prior-work-penalty" },
      robots: { index: true, follow: true },
    });
    render(<PriorWorkPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Minecraft Prior Work Penalty" })).toBeVisible();
    expect(screen.getByText("penalty = 2^priorWork − 1")).toBeVisible();
    const table = screen.getByRole("table", { name: "Prior-work penalty values" });
    expect(within(table).getAllByRole("row")).toHaveLength(8);
    expect(within(table).getByRole("row", { name: "6 63" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Least total levels" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Preserve future work" })).toBeVisible();
    expect(screen.getByText(/Verified for Java Edition 26.2 on 2026-08-17/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Open the Minecraft Enchantment Calculator" })).toHaveAttribute("href", "/#calculator");
    expect(screen.getByRole("link", { name: /Too Expensive/i })).toHaveAttribute("href", "/minecraft-anvil-too-expensive");
    expect(document.querySelectorAll("details")).toHaveLength(4);
  });

  it("renders the complete Too Expensive guide contract without claiming every case is fixable", () => {
    expect(tooExpensiveMetadata).toMatchObject({
      title: { absolute: "Minecraft Anvil Too Expensive – Causes and Fixes" },
      description:
        "See why a Minecraft anvil says Too Expensive, how the 40-level Survival limit works, and when a better enchantment order can fix it.",
      alternates: { canonical: "/minecraft-anvil-too-expensive" },
      robots: { index: true, follow: true },
    });
    render(<TooExpensivePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Minecraft Anvil Too Expensive" })).toBeVisible();
    expect(screen.getByText(/single anvil operation costs 40 levels or more/i)).toBeVisible();
    expect(screen.getByText(/does not guarantee that every case can be fixed/i)).toBeVisible();
    expect(screen.getByText(/Highest optimized step/i)).toBeVisible();
    expect(screen.getByText(/Verified for Java Edition 26.2 on 2026-08-17/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "Open the Minecraft Enchantment Calculator" })).toHaveAttribute("href", "/#calculator");
    expect(screen.getByRole("link", { name: /Prior Work Penalty/i })).toHaveAttribute("href", "/minecraft-prior-work-penalty");
    expect(document.querySelectorAll("details")).toHaveLength(4);
  });

  it("keeps the homepage title fixed and publishes exactly four sitemap URLs", () => {
    expect(homeMetadata.title).toBe("Minecraft Enchantment Calculator – Best Anvil Order");
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://enchantmentcalculator.com",
      "https://enchantmentcalculator.com/about",
      "https://enchantmentcalculator.com/minecraft-prior-work-penalty",
      "https://enchantmentcalculator.com/minecraft-anvil-too-expensive",
    ]);
  });

  it("adds compact guide links to the existing footer navigation", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Prior Work Penalty" })).toHaveAttribute("href", "/minecraft-prior-work-penalty");
    expect(screen.getByRole("link", { name: "Too Expensive" })).toHaveAttribute("href", "/minecraft-anvil-too-expensive");
  });
});
