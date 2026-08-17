import { describe, expect, it } from "vitest";
import {
  areEnchantmentsCompatible,
  findCompatibilityConflicts,
} from "@/domain/enchanting/compatibility";

describe("enchantment compatibility", () => {
  it("blocks official exclusive-set pairs", () => {
    expect(areEnchantmentsCompatible("fortune", "silk_touch")).toBe(false);
    expect(areEnchantmentsCompatible("sharpness", "smite")).toBe(false);
  });

  it("allows enchantments from different exclusive sets", () => {
    expect(areEnchantmentsCompatible("sharpness", "unbreaking")).toBe(true);
  });

  it("returns each conflict once in stable order", () => {
    expect(
      findCompatibilityConflicts(["smite", "sharpness", "silk_touch", "fortune"]),
    ).toEqual([
      ["fortune", "silk_touch"],
      ["sharpness", "smite"],
    ]);
  });
});
