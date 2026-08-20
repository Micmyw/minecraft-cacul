import { describe, expect, it } from "vitest";
import { nextPriorWork } from "@/domain/enchanting/prior-work";
import { calculateSequentialBaseline } from "@/domain/enchanting/sequential-baseline";
import { solve } from "@/domain/enchanting/solver";
import {
  priorWorkGuideExample,
  tooExpensiveGuideExample,
} from "@/content/guide-examples";

describe("solver-verified guide examples", () => {
  it("keeps the prior-work example summary synchronized with the engine", async () => {
    const result = await solve(priorWorkGuideExample.request);
    const sequential = calculateSequentialBaseline(priorWorkGuideExample.request);
    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect({
      totalLevels: result.totalLevels,
      highestStepCost: result.highestStepCost,
      finalPriorWork: result.finalPriorWork,
      legalInSurvival: result.legalInSurvival,
      stepCosts: result.steps.map((step) => step.levelCost),
      stepPriorWork: result.steps.map((step) => ({
        left: step.left.priorWork,
        right: step.right.priorWork,
        result: step.result.priorWork,
      })),
    }).toEqual({
      ...priorWorkGuideExample.optimized.summary,
      stepCosts: priorWorkGuideExample.optimized.steps.map((step) => step.cost),
      stepPriorWork: priorWorkGuideExample.optimized.steps.map((step) => ({
        left: step.leftPriorWork,
        right: step.rightPriorWork,
        result: step.resultPriorWork,
      })),
    });
    expect(priorWorkGuideExample.optimized.steps.some((step) => step.combinesBooks)).toBe(true);
    for (const step of priorWorkGuideExample.optimized.steps) {
      expect(step.resultPriorWork).toBe(
        nextPriorWork(step.leftPriorWork, step.rightPriorWork),
      );
    }
    expect({
      totalLevels: sequential.totalLevels,
      legalInSurvival: sequential.legalInSurvival,
      stepCosts: sequential.steps.map((step) => step.levelCost),
    }).toEqual(priorWorkGuideExample.sequential);
    expect(result.totalLevels).toBeLessThan(sequential.totalLevels ?? Infinity);
  });

  it("proves the Too Expensive example is an order problem, not a total-level limit", async () => {
    const result = await solve(tooExpensiveGuideExample.request);
    const sequential = calculateSequentialBaseline(tooExpensiveGuideExample.request);
    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect({
      totalLevels: result.totalLevels,
      highestStepCost: result.highestStepCost,
      finalPriorWork: result.finalPriorWork,
      legalInSurvival: result.legalInSurvival,
      stepCosts: result.steps.map((step) => step.levelCost),
    }).toEqual({
      ...tooExpensiveGuideExample.optimized.summary,
      stepCosts: tooExpensiveGuideExample.optimized.steps.map((step) => step.cost),
    });
    expect(result.totalLevels).toBeGreaterThan(result.highestStepCost);
    expect(result.highestStepCost).toBe(
      Math.max(...result.steps.map((step) => step.levelCost)),
    );

    const firstBlockedStep = sequential.steps.find((step) => !step.legalInSurvival);
    expect(sequential.legalInSurvival).toBe(false);
    expect(sequential.totalLevels).toBeNull();
    expect(firstBlockedStep?.levelCost).toBeGreaterThanOrEqual(40);
    expect({
      totalLevels: sequential.totalLevels,
      legalInSurvival: sequential.legalInSurvival,
      stepCosts: sequential.steps.map((step) => step.levelCost),
      tooExpensiveStepCost: firstBlockedStep?.levelCost,
    }).toEqual(tooExpensiveGuideExample.sequential);
    expect(result.warnings).toContain("The sequential order reaches Too Expensive.");
  });
});
