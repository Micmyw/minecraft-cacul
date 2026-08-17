import { describe, expect, it } from "vitest";
import { createCatalogSnapshot } from "@/workers/protocol";

describe("worker catalog protocol", () => {
  it("exposes the UI catalog without internal search state", () => {
    const catalog = createCatalogSnapshot();
    expect(catalog.items.length).toBeGreaterThan(20);
    expect(catalog.enchantments.find((item) => item.id === "lunge")).toEqual({
      id: "lunge",
      name: "Lunge",
      maxLevel: 3,
      supportedItemIds: ["spear"],
      incompatibleWith: [],
    });
    expect(catalog).not.toHaveProperty("searchStates");
  });
});
