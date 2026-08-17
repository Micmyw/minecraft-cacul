import { describe, expect, it } from "vitest";
import { combineIngredients } from "@/domain/enchanting/combine";
import { ingredient } from "../fixtures/ingredients";

describe("anvil combination", () => {
  it("applies a fresh Sharpness V book to a fresh sword for 5 levels", () => {
    const result = combineIngredients(
      ingredient({ id: "target", kind: "target" }),
      ingredient({
        id: "sharpness-book",
        kind: "book",
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
      }),
      39,
    );

    expect(result).toMatchObject({ levelCost: 5, legalInSurvival: true, warnings: [] });
    expect(result?.result.priorWork).toBe(1);
    expect(result?.result.enchantments).toEqual([
      { enchantmentId: "sharpness", level: 5 },
    ]);
  });

  it("uses the lower enchanted-book multiplier", () => {
    const target = ingredient({ id: "target", kind: "target" });
    const book = ingredient({
      id: "book",
      kind: "book",
      enchantments: [{ enchantmentId: "mending", level: 1 }],
    });
    const item = ingredient({
      id: "item",
      kind: "item",
      enchantments: [{ enchantmentId: "mending", level: 1 }],
    });

    expect(combineIngredients(target, book, 39)?.levelCost).toBe(2);
    expect(combineIngredients(target, item, 39)?.levelCost).toBe(4);
  });

  it("upgrades equal enchantment levels without exceeding the maximum", () => {
    const result = combineIngredients(
      ingredient({
        id: "target",
        kind: "target",
        enchantments: [{ enchantmentId: "sharpness", level: 4 }],
      }),
      ingredient({
        id: "book",
        kind: "book",
        enchantments: [{ enchantmentId: "sharpness", level: 4 }],
      }),
      39,
    );

    expect(result?.levelCost).toBe(5);
    expect(result?.result.enchantments).toEqual([
      { enchantmentId: "sharpness", level: 5 },
    ]);
  });

  it("drops inapplicable enchantments from a mixed book with a warning", () => {
    const result = combineIngredients(
      ingredient({ id: "target", kind: "target" }),
      ingredient({
        id: "mixed-book",
        kind: "book",
        enchantments: [
          { enchantmentId: "power", level: 5 },
          { enchantmentId: "mending", level: 1 },
        ],
      }),
      39,
    );

    expect(result?.levelCost).toBe(2);
    expect(result?.result.enchantments).toEqual([
      { enchantmentId: "mending", level: 1 },
    ]);
    expect(result?.warnings).toEqual([
      "Power V was not applicable to Sword and was discarded.",
    ]);
  });

  it("marks a cost of 40 as Too Expensive", () => {
    const result = combineIngredients(
      ingredient({ id: "target", kind: "target", priorWork: 5 }),
      ingredient({
        id: "book",
        kind: "book",
        priorWork: 3,
        enchantments: [{ enchantmentId: "mending", level: 1 }],
      }),
      39,
    );

    expect(result).toMatchObject({ levelCost: 40, legalInSurvival: false });
  });

  it("never sacrifices the target lineage in the right slot", () => {
    expect(
      combineIngredients(
        ingredient({ id: "item", kind: "item" }),
        ingredient({ id: "target", kind: "target" }),
        39,
      ),
    ).toBeNull();
  });
});
