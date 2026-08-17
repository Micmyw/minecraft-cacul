import { describe, expect, it } from "vitest";
import { validateSolveRequest } from "@/domain/enchanting/validation";
import { ingredient, request } from "../fixtures/ingredients";

describe("solve request validation", () => {
  it("accepts a valid Java 26.2 request", () => {
    expect(validateSolveRequest(request())).toEqual([]);
  });

  it("requires at least one sacrifice", () => {
    expect(validateSolveRequest(request({ sacrifices: [] }))).toContain(
      "Add at least one enchanted book.",
    );
  });

  it("rejects duplicate ingredient ids", () => {
    expect(
      validateSolveRequest(
        request({ sacrifices: [ingredient({ id: "target", kind: "book" })] }),
      ),
    ).toContain("Each ingredient must have a unique id.");
  });

  it("rejects unknown and over-level enchantments", () => {
    const errors = validateSolveRequest(
      request({
        sacrifices: [
          ingredient({
            id: "bad",
            kind: "book",
            enchantments: [
              { enchantmentId: "unknown", level: 1 },
              { enchantmentId: "mending", level: 2 },
            ],
          }),
        ],
      }),
    );

    expect(errors).toContain('Unknown enchantment "unknown".');
    expect(errors).toContain("Mending supports levels 1–1.");
  });

  it("rejects incompatible enchantments across ingredients", () => {
    const errors = validateSolveRequest(
      request({
        target: ingredient({ id: "target", kind: "target", itemId: "pickaxe" }),
        sacrifices: [
          ingredient({
            id: "fortune",
            kind: "book",
            enchantments: [{ enchantmentId: "fortune", level: 3 }],
          }),
          ingredient({
            id: "silk",
            kind: "book",
            enchantments: [{ enchantmentId: "silk_touch", level: 1 }],
          }),
        ],
      }),
    );

    expect(errors).toContain("Fortune and Silk Touch cannot be used together.");
  });

  it("rejects books with no enchantment usable by the target", () => {
    expect(
      validateSolveRequest(
        request({
          sacrifices: [
            ingredient({
              id: "power",
              kind: "book",
              enchantments: [{ enchantmentId: "power", level: 5 }],
            }),
          ],
        }),
      ),
    ).toContain("Book power has no enchantment that can apply to Sword without conflicting with the target.");
  });

  it("limits Inventory plans to 32 sacrifices", () => {
    const sacrifices = Array.from({ length: 33 }, (_, index) =>
      ingredient({
        id: `book-${index}`,
        kind: "book",
        enchantments: [{ enchantmentId: "mending", level: 1 }],
      }),
    );
    expect(validateSolveRequest(request({ sacrifices }))).toContain(
      "A plan can contain at most 32 sacrifices.",
    );
  });
});
