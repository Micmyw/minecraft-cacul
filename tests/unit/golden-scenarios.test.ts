import { describe, expect, it } from "vitest";
import { solve } from "@/domain/enchanting/solver";
import { createCatalogSnapshot } from "@/workers/protocol";
import { decodePlanState, encodePlanState } from "@/lib/share-state";
import { goldenSolveScenarios, shareStateFixtures } from "../fixtures/golden-scenarios";

function normalizedSteps(
  steps: Array<{ left: { id: string }; right: { id: string }; levelCost: number }>,
): string[] {
  return steps.map((step) => `${step.left.id}>${step.right.id}@${step.levelCost}`);
}

describe("AnvilPilot v1 golden solver scenarios", () => {
  it.each(goldenSolveScenarios)("$name", async ({ request, expected }) => {
    const result = await solve(request);
    expect(result.status).toBe(expected.status);

    if (expected.status === "invalid-input") {
      expect(result.status).toBe("invalid-input");
      if (result.status !== "invalid-input") return;
      expect(result.errors.join(" ")).toContain(expected.errorIncludes);
      return;
    }

    if (expected.status === "no-legal-plan") {
      expect(result.status).toBe("no-legal-plan");
      if (result.status !== "no-legal-plan") return;
      expect(result.quality).toBe(expected.quality);
      expect(result.blockingSteps.map((step) => step.levelCost)).toEqual(expected.stepCosts);
      expect(result.blockingSteps.filter((step) => !step.legalInSurvival)).toHaveLength(1);
      return;
    }

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.quality).toBe(expected.quality);
    if (expected.totalLevels !== undefined) expect(result.totalLevels).toBe(expected.totalLevels);
    if (expected.stepCosts) expect(result.steps.map((step) => step.levelCost)).toEqual(expected.stepCosts);
    if (expected.normalizedSteps) expect(normalizedSteps(result.steps)).toEqual(expected.normalizedSteps);
    if (expected.upstreamStepCostMultiset) {
      expect(result.steps.map((step) => step.levelCost).sort((a, b) => a - b)).toEqual(
        expected.upstreamStepCostMultiset,
      );
    }
    if (expected.finalPriorWork !== undefined) expect(result.finalPriorWork).toBe(expected.finalPriorWork);
    if (expected.warningIncludes) expect(result.warnings.join(" ")).toContain(expected.warningIncludes);

    expect(result.steps).toHaveLength(request.sacrifices.length);
    expect(result.totalLevels).toBe(result.steps.reduce((sum, step) => sum + step.levelCost, 0));
    expect(result.highestStepCost).toBe(Math.max(...result.steps.map((step) => step.levelCost)));
    expect(result.finalPriorWork).toBe(result.steps.at(-1)?.result.priorWork);
    expect(result.steps.every((step) => step.legalInSurvival)).toBe(true);
    for (const source of [request.target, ...request.sacrifices]) {
      expect(result.steps.some((step) => step.left.id === source.id || step.right.id === source.id)).toBe(true);
    }
  }, 30_000);
});

describe("AnvilPilot v1 golden share-state scenarios", () => {
  const catalog = createCatalogSnapshot();

  it.each(shareStateFixtures)("$name", (fixture) => {
    const encoded = "encoded" in fixture ? fixture.encoded : encodePlanState(fixture.value as never);
    expect(decodePlanState(encoded, catalog).ok).toBe(fixture.valid);
  });
});
