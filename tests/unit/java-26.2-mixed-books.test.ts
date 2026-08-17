import { describe, expect, it } from "vitest";
import { combineIngredients } from "@/domain/enchanting/combine";
import { validateSolveRequest } from "@/domain/enchanting/validation";
import {
  java262MixedBookFixtures,
  java262MixedBookSource,
} from "../fixtures/java-26.2-mixed-books";
import { request } from "../fixtures/ingredients";

describe("Java Edition 26.2 mixed enchanted books", () => {
  it("pins the official comparison artifact", () => {
    expect(java262MixedBookSource).toMatchObject({
      gameVersion: "26.2",
      serverJarSha1: "823e2250d24b3ddac457a60c92a6a941943fcd6a",
      implementation: "net.minecraft.world.inventory.AnvilMenu#createResult",
    });
  });

  it.each(java262MixedBookFixtures)("$name", ({ target, book, expected }) => {
    const errors = validateSolveRequest(request({ target, sacrifices: [book] }));

    if (expected.outcome === "invalid-input") {
      expect(errors.join(" ")).toContain("has no enchantment that can apply");
      return;
    }

    expect(errors).toEqual([]);
    const outcome = combineIngredients(target, book, 39);
    expect(outcome?.levelCost).toBe(expected.levelCost);
    expect(outcome?.result.enchantments).toEqual(expected.enchantments);
    if (expected.warningIncludes) {
      expect(outcome?.warnings.join(" ")).toContain(expected.warningIncludes);
    } else {
      expect(outcome?.warnings).toEqual([]);
    }
  });
});
