import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import EnchantmentReferencePage, {
  metadata,
} from "@/app/minecraft-enchantments/page";
import LicensesPage from "@/app/licenses/page";
import { createCatalogSnapshot } from "@/workers/protocol";
import { decodePlanState } from "@/lib/share-state";

afterEach(() => cleanup());

describe("enchantment reference hub", () => {
  it("publishes an indexable, source-dated reference page", () => {
    expect(metadata).toMatchObject({
      title: {
        absolute: "Minecraft Enchantments List – Items, Levels & Conflicts",
      },
      alternates: { canonical: "/minecraft-enchantments" },
      robots: { index: true, follow: true },
      openGraph: {
        type: "website",
        url: "/minecraft-enchantments",
        title: "Minecraft Enchantments List – Items, Levels & Conflicts",
      },
      twitter: {
        card: "summary_large_image",
        title: "Minecraft Enchantments List – Items, Levels & Conflicts",
      },
    });

    render(<EnchantmentReferencePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Minecraft Enchantments Reference",
      }),
    ).toBeVisible();
    expect(screen.getByText("43 enchantments")).toBeVisible();
    expect(screen.getByText("26 item groups")).toBeVisible();
    expect(screen.getByText(/Verified September 7, 2026/i)).toBeVisible();
  });

  it("puts catalog lookup before ready-made work orders", () => {
    render(<EnchantmentReferencePage />);
    const catalog = screen
      .getByRole("heading", { name: "Find the right enchantment" })
      .closest("section");
    const presets = screen
      .getByRole("heading", { name: "Start from a proven build" })
      .closest("section");

    expect(catalog).not.toBeNull();
    expect(presets).not.toBeNull();
    const relation = catalog?.compareDocumentPosition(presets as Node) ?? 0;
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("filters the ledger by search, item, and incompatibility", async () => {
    const user = userEvent.setup();
    render(<EnchantmentReferencePage />);

    const ledger = screen.getByTestId("enchantment-ledger");
    expect(within(ledger).getAllByRole("article")).toHaveLength(43);

    await user.type(screen.getByRole("searchbox", { name: "Search enchantments" }), "mend");
    expect(within(ledger).getAllByRole("article")).toHaveLength(1);
    expect(within(ledger).getByRole("heading", { name: "Mending" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by item" }), "bow");
    expect(within(ledger).getByRole("heading", { name: "Power" })).toBeVisible();
    expect(within(ledger).queryByRole("heading", { name: "Density" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Has conflicts only" }));
    expect(within(ledger).getByRole("heading", { name: "Infinity" })).toBeVisible();
    expect(within(ledger).queryByRole("heading", { name: "Power" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/of 43 enchantments/i);
  });

  it("provides solver-valid calculator links for ready-made builds", () => {
    render(<EnchantmentReferencePage />);
    const link = screen.getByRole("link", { name: "Load Maxed Sword in calculator" });
    const href = link.getAttribute("href");
    expect(href).toMatch(/^\/#plan=v1\./u);

    const encoded = href?.split("#plan=")[1] ?? "";
    const decoded = decodePlanState(encoded, createCatalogSnapshot());
    expect(decoded.ok).toBe(true);
    if (!decoded.ok || decoded.state.plannerMode !== "quick") return;
    expect(decoded.state.targetItemId).toBe("sword");
    expect(decoded.state.enchantments).toHaveLength(7);
  });
});

describe("static legal content", () => {
  it("renders the license without runtime filesystem access", () => {
    const output = LicensesPage();
    expect(output).not.toBeInstanceOf(Promise);
    if (output instanceof Promise) return;
    render(output);
    expect(screen.getByRole("heading", { name: "Open Source Licenses" })).toBeVisible();
    expect(screen.getByText(/Copyright \(c\) 2021 Cal Henderson/i)).toBeVisible();
  });
});
