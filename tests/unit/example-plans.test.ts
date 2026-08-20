import { describe, expect, it } from "vitest";
import { solve } from "@/domain/enchanting/solver";
import {
  examplePlans,
  getExamplePlan,
  type ExamplePlanId,
} from "@/features/planner/example-plans";
import { planStateToSolveRequest } from "@/lib/share-state";
import { createCatalogSnapshot } from "@/workers/protocol";

const expectedEnchantments: Record<ExamplePlanId, string[]> = {
  maxed_sword: [
    "sharpness:5",
    "looting:3",
    "sweeping_edge:3",
    "knockback:2",
    "fire_aspect:2",
    "unbreaking:3",
    "mending:1",
  ],
  fortune_pickaxe: [
    "efficiency:5",
    "fortune:3",
    "unbreaking:3",
    "mending:1",
  ],
  survival_boots: [
    "protection:4",
    "feather_falling:4",
    "depth_strider:3",
    "soul_speed:3",
    "thorns:3",
    "unbreaking:3",
    "mending:1",
  ],
};

function stableResult<T extends { statistics?: { elapsedMs: number } }>(result: T) {
  return result.statistics
    ? { ...result, statistics: { ...result.statistics, elapsedMs: 0 } }
    : result;
}

describe("verified example plans", () => {
  it("exports the three immutable examples in the required order", () => {
    expect(examplePlans.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: "maxed_sword", label: "Maxed Sword" },
      { id: "fortune_pickaxe", label: "Fortune Pickaxe" },
      { id: "survival_boots", label: "Survival Boots" },
    ]);
    expect(Object.isFrozen(examplePlans)).toBe(true);
    for (const example of examplePlans) {
      expect(getExamplePlan(example.id)).toBe(example);
      expect(Object.isFrozen(example)).toBe(true);
      expect(Object.isFrozen(example.state)).toBe(true);
      expect(Object.isFrozen(example.state.enchantments)).toBe(true);
    }
  });

  it.each(examplePlans)("solves $label exactly and legally with current catalog IDs", async (example) => {
    const catalog = createCatalogSnapshot();
    const request = planStateToSolveRequest(example.state);

    expect(request.sacrifices.length).toBeLessThanOrEqual(8);
    for (const selected of example.state.enchantments) {
      const definition = catalog.enchantments.find(
        (entry) => entry.id === selected.enchantmentId,
      );
      expect(definition, selected.enchantmentId).toBeDefined();
      expect(selected.level).toBeGreaterThanOrEqual(1);
      expect(selected.level).toBeLessThanOrEqual(definition?.maxLevel ?? 0);
      expect(definition?.supportedItemIds).toContain(example.state.targetItemId);
    }

    const first = await solve(request);
    const second = await solve(request);
    expect(first.status).toBe("success");
    expect(second.status).toBe("success");
    if (first.status !== "success" || second.status !== "success") return;

    expect(first.quality).toBe("exact-optimal");
    expect(first.statistics.exactSearch).toBe(true);
    expect(first.legalInSurvival).toBe(true);
    expect(first.steps).toHaveLength(request.sacrifices.length);
    expect(stableResult(first)).toEqual(stableResult(second));

    const finalEnchantments = first.steps.at(-1)?.result.enchantments
      .map(({ enchantmentId, level }) => `${enchantmentId}:${level}`)
      .sort();
    expect(finalEnchantments).toEqual([...expectedEnchantments[example.id]].sort());
  }, 30_000);
});
