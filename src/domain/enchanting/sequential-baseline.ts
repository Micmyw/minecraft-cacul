import { combineIngredients } from "./combine";
import type { CombineStep, SolveRequest } from "./types";

export type SequentialBaseline = {
  steps: CombineStep[];
  totalLevels: number | null;
  legalInSurvival: boolean;
};

export function calculateSequentialBaseline(
  request: SolveRequest,
): SequentialBaseline {
  let current = request.target;
  const steps: CombineStep[] = [];
  let totalLevels = 0;
  let legalInSurvival = true;
  for (const sacrifice of request.sacrifices) {
    const outcome = combineIngredients(
      current,
      sacrifice,
      request.survivalMaxStepCost,
    );
    if (!outcome) {
      return { steps, totalLevels: null, legalInSurvival: false };
    }
    steps.push({
      id: `sequential-${steps.length + 1}`,
      left: current,
      right: sacrifice,
      result: outcome.result,
      levelCost: outcome.levelCost,
      legalInSurvival: outcome.legalInSurvival,
    });
    totalLevels += outcome.levelCost;
    legalInSurvival &&= outcome.legalInSurvival;
    current = outcome.result;
  }
  return {
    steps,
    totalLevels: legalInSurvival ? totalLevels : null,
    legalInSurvival,
  };
}
