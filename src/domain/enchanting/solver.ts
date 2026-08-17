import { calculateSequentialBaseline } from "./sequential-baseline";
import { solveExact } from "./solver-exact";
import { solveHeuristic } from "./solver-heuristic";
import {
  finalizeSteps,
  type SearchControl,
} from "./search-common";
import {
  EXACT_SEARCH_MAX_INGREDIENTS,
  type PlanQuality,
  type SolveRequest,
  type SolveResult,
} from "./types";
import { validateSolveRequest } from "./validation";

function uniqueWarnings(warnings: string[]): string[] {
  return [...new Set(warnings)];
}

export async function solve(
  request: SolveRequest,
  control: SearchControl = {},
): Promise<SolveResult> {
  const errors = validateSolveRequest(request);
  if (errors.length > 0) return { status: "invalid-input", errors };

  const exactSearch =
    request.sacrifices.length <= EXACT_SEARCH_MAX_INGREDIENTS;
  const quality: PlanQuality = exactSearch ? "exact-optimal" : "best-found";
  const startedAt = performance.now();
  const outcome = exactSearch
    ? await solveExact(request, control)
    : await solveHeuristic(request, control);
  const statistics = {
    exploredStates: outcome.exploredStates,
    elapsedMs: Math.max(0, performance.now() - startedAt),
    exactSearch,
  };

  if (outcome.solution) {
    const solution = outcome.solution;
    const baseline = calculateSequentialBaseline(request);
    const baselineTotalLevels = baseline.totalLevels;
    const warnings = [...solution.warnings];
    if (!exactSearch) {
      warnings.push(
        "This plan is the best deterministic result found; it is not a mathematical proof of the cheapest order.",
      );
    }
    if (!baseline.legalInSurvival) {
      warnings.push("The sequential order reaches Too Expensive.");
    }
    return {
      status: "success",
      quality,
      steps: finalizeSteps(solution),
      totalLevels: solution.totalLevels,
      highestStepCost: solution.highestStepCost,
      finalPriorWork: solution.ingredient.priorWork,
      legalInSurvival: solution.legal,
      baselineTotalLevels,
      levelsSaved:
        baselineTotalLevels === null
          ? null
          : baselineTotalLevels - solution.totalLevels,
      warnings: uniqueWarnings(warnings),
      statistics,
    };
  }

  const diagnostic = outcome.diagnostic;
  return {
    status: "no-legal-plan",
    quality,
    blockingSteps: diagnostic ? finalizeSteps(diagnostic) : [],
    warnings: uniqueWarnings([
      ...(diagnostic?.warnings ?? []),
      exactSearch
        ? "No Survival-legal plan exists for these inputs."
        : "No Survival-legal plan was found. Reduce prior work or split the plan.",
    ]),
    statistics,
  };
}
