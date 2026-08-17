import { combineIngredients } from "./combine";
import type {
  CombineStep,
  Ingredient,
  OptimizeMode,
  SearchProgress,
  SolveRequest,
} from "./types";

export type { SearchPhase, SearchProgress } from "./types";

export type SearchControl = {
  isCancelled?: () => boolean;
  onProgress?: (progress: SearchProgress) => void;
  yieldControl?: () => Promise<void>;
};

export class SearchCancelledError extends Error {
  constructor() {
    super("Search cancelled");
    this.name = "SearchCancelledError";
  }
}

export type Candidate = {
  ingredient: Ingredient;
  steps: CombineStep[];
  totalLevels: number;
  highestStepCost: number;
  warnings: string[];
  legal: boolean;
  illegalCount: number;
  illegalExcess: number;
  canonical: string;
};

export type SearchOutcome = {
  solution: Candidate | null;
  diagnostic: Candidate | null;
  exploredStates: number;
};

export function leafCandidate(ingredient: Ingredient): Candidate {
  return {
    ingredient: { ...ingredient, enchantments: ingredient.enchantments.map((item) => ({ ...item })) },
    steps: [],
    totalLevels: 0,
    highestStepCost: 0,
    warnings: [],
    legal: true,
    illegalCount: 0,
    illegalExcess: 0,
    canonical: ingredient.id,
  };
}

export function mergeCandidates(
  left: Candidate,
  right: Candidate,
  survivalMaxStepCost: number,
): Candidate | null {
  const outcome = combineIngredients(
    left.ingredient,
    right.ingredient,
    survivalMaxStepCost,
  );
  if (!outcome) return null;
  const step: CombineStep = {
    id: `step:${left.canonical}>${right.canonical}`,
    left: left.ingredient,
    right: right.ingredient,
    result: outcome.result,
    levelCost: outcome.levelCost,
    legalInSurvival: outcome.legalInSurvival,
  };
  return {
    ingredient: outcome.result,
    steps: [...left.steps, ...right.steps, step],
    totalLevels: left.totalLevels + right.totalLevels + outcome.levelCost,
    highestStepCost: Math.max(
      left.highestStepCost,
      right.highestStepCost,
      outcome.levelCost,
    ),
    warnings: [...left.warnings, ...right.warnings, ...outcome.warnings],
    legal: left.legal && right.legal && outcome.legalInSurvival,
    illegalCount:
      left.illegalCount + right.illegalCount + (outcome.legalInSurvival ? 0 : 1),
    illegalExcess:
      left.illegalExcess +
      right.illegalExcess +
      Math.max(0, outcome.levelCost - survivalMaxStepCost),
    canonical: `(${left.canonical}>${right.canonical})`,
  };
}

export function ingredientFingerprint(ingredient: Ingredient): string {
  const enchantments = ingredient.enchantments
    .map((enchantment) => `${enchantment.enchantmentId}:${enchantment.level}`)
    .sort()
    .join(",");
  return [
    ingredient.kind,
    ingredient.itemId ?? "book",
    ingredient.priorWork,
    enchantments,
  ].join("|");
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareCandidates(
  left: Candidate,
  right: Candidate,
  mode: OptimizeMode,
): number {
  const leftValues =
    mode === "least-total-levels"
      ? [left.totalLevels, left.highestStepCost, left.ingredient.priorWork]
      : [left.ingredient.priorWork, left.totalLevels, left.highestStepCost];
  const rightValues =
    mode === "least-total-levels"
      ? [right.totalLevels, right.highestStepCost, right.ingredient.priorWork]
      : [right.ingredient.priorWork, right.totalLevels, right.highestStepCost];
  for (let index = 0; index < leftValues.length; index += 1) {
    if (leftValues[index] !== rightValues[index]) {
      return leftValues[index] - rightValues[index];
    }
  }
  return compareStrings(left.canonical, right.canonical);
}

export function compareDiagnosticCandidates(
  left: Candidate,
  right: Candidate,
  mode: OptimizeMode,
): number {
  if (left.illegalCount !== right.illegalCount) {
    return left.illegalCount - right.illegalCount;
  }
  if (left.illegalExcess !== right.illegalExcess) {
    return left.illegalExcess - right.illegalExcess;
  }
  return compareCandidates(left, right, mode);
}

export function finalizeSteps(candidate: Candidate): CombineStep[] {
  return candidate.steps.map((step, index) => ({ ...step, id: `step-${index + 1}` }));
}

export async function checkpoint(
  control: SearchControl,
  progress: SearchProgress,
): Promise<void> {
  if (control.isCancelled?.()) throw new SearchCancelledError();
  control.onProgress?.(progress);
  if (control.yieldControl) await control.yieldControl();
}

export function createLeaves(request: SolveRequest): Candidate[] {
  return [request.target, ...request.sacrifices].map(leafCandidate);
}
