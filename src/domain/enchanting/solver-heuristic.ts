import {
  checkpoint,
  compareCandidates,
  compareDiagnosticCandidates,
  createLeaves,
  ingredientFingerprint,
  mergeCandidates,
  type Candidate,
  type SearchControl,
  type SearchOutcome,
} from "./search-common";
import type { OptimizeMode, SolveRequest } from "./types";

const HEURISTIC_BEAM_WIDTH = 64;
const HEURISTIC_PAIR_LIMIT_PER_STATE = 96;

type BeamState = {
  parts: Candidate[];
  canonical: string;
};

function compareCanonical(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stateCanonical(parts: Candidate[]): string {
  return parts.map((part) => part.canonical).sort().join(";");
}

function stateFingerprint(parts: Candidate[]): string {
  return parts
    .map((part) => `${ingredientFingerprint(part.ingredient)}:${part.legal}`)
    .sort()
    .join(";");
}

function stateMetrics(state: BeamState) {
  const totalLevels = state.parts.reduce((sum, part) => sum + part.totalLevels, 0);
  const highestStepCost = Math.max(
    0,
    ...state.parts.map((part) => part.highestStepCost),
  );
  const target = state.parts.find((part) => part.ingredient.kind === "target");
  const otherPriorWork = Math.max(
    0,
    ...state.parts
      .filter((part) => part !== target)
      .map((part) => part.ingredient.priorWork),
  );
  const estimatedFinalPriorWork =
    state.parts.length === 1
      ? target?.ingredient.priorWork ?? otherPriorWork
      : Math.max(target?.ingredient.priorWork ?? 0, otherPriorWork) + 1;
  const illegalCount = state.parts.reduce((sum, part) => sum + part.illegalCount, 0);
  const illegalExcess = state.parts.reduce((sum, part) => sum + part.illegalExcess, 0);
  return { totalLevels, highestStepCost, estimatedFinalPriorWork, illegalCount, illegalExcess };
}

function compareBeamStates(
  left: BeamState,
  right: BeamState,
  mode: OptimizeMode,
  allowIllegal: boolean,
): number {
  const a = stateMetrics(left);
  const b = stateMetrics(right);
  const valuesA = allowIllegal
    ? [a.illegalCount, a.illegalExcess]
    : [];
  const valuesB = allowIllegal
    ? [b.illegalCount, b.illegalExcess]
    : [];
  if (mode === "least-total-levels") {
    valuesA.push(a.totalLevels, a.highestStepCost, a.estimatedFinalPriorWork);
    valuesB.push(b.totalLevels, b.highestStepCost, b.estimatedFinalPriorWork);
  } else {
    valuesA.push(a.estimatedFinalPriorWork, a.totalLevels, a.highestStepCost);
    valuesB.push(b.estimatedFinalPriorWork, b.totalLevels, b.highestStepCost);
  }
  for (let index = 0; index < valuesA.length; index += 1) {
    if (valuesA[index] !== valuesB[index]) return valuesA[index] - valuesB[index];
  }
  return compareCanonical(left.canonical, right.canonical);
}

async function runBeam(
  request: SolveRequest,
  control: SearchControl,
  allowIllegal: boolean,
  initialExplored: number,
): Promise<{ candidate: Candidate | null; exploredStates: number }> {
  let beam: BeamState[] = [
    { parts: createLeaves(request), canonical: stateCanonical(createLeaves(request)) },
  ];
  let exploredStates = initialExplored;
  const initialCount = beam[0].parts.length;

  while (beam.length > 0 && beam[0].parts.length > 1) {
    const next = new Map<string, BeamState>();
    for (const state of beam) {
      const expansions: BeamState[] = [];
      for (let leftIndex = 0; leftIndex < state.parts.length; leftIndex += 1) {
        for (let rightIndex = 0; rightIndex < state.parts.length; rightIndex += 1) {
          if (leftIndex === rightIndex) continue;
          exploredStates += 1;
          const merged = mergeCandidates(
            state.parts[leftIndex],
            state.parts[rightIndex],
            request.survivalMaxStepCost,
          );
          if (!merged || (!allowIllegal && !merged.legal)) continue;
          const parts = state.parts.filter(
            (_, index) => index !== leftIndex && index !== rightIndex,
          );
          parts.push(merged);
          expansions.push({ parts, canonical: stateCanonical(parts) });
          if (exploredStates % 512 === 0) {
            await checkpoint(control, {
              phase: "heuristic-search",
              exploredStates,
              progress: (initialCount - state.parts.length) / (initialCount - 1),
            });
          }
        }
      }
      expansions
        .sort((left, right) =>
          compareBeamStates(left, right, request.optimizeMode, allowIllegal),
        )
        .slice(0, HEURISTIC_PAIR_LIMIT_PER_STATE)
        .forEach((expansion) => {
          const key = stateFingerprint(expansion.parts);
          const current = next.get(key);
          if (
            !current ||
            compareBeamStates(
              expansion,
              current,
              request.optimizeMode,
              allowIllegal,
            ) < 0
          ) {
            next.set(key, expansion);
          }
        });
    }
    beam = [...next.values()]
      .sort((left, right) =>
        compareBeamStates(left, right, request.optimizeMode, allowIllegal),
      )
      .slice(0, HEURISTIC_BEAM_WIDTH);
  }

  await checkpoint(control, {
    phase: "heuristic-search",
    exploredStates,
    progress: 1,
  });
  const candidates = beam
    .filter((state) => state.parts.length === 1)
    .map((state) => state.parts[0])
    .filter((candidate) => candidate.ingredient.kind === "target");
  const candidate = candidates.sort((left, right) =>
    allowIllegal
      ? compareDiagnosticCandidates(left, right, request.optimizeMode)
      : compareCandidates(left, right, request.optimizeMode),
  )[0] ?? null;
  return { candidate, exploredStates };
}

export async function solveHeuristic(
  request: SolveRequest,
  control: SearchControl = {},
): Promise<SearchOutcome> {
  const legal = await runBeam(request, control, false, 0);
  if (legal.candidate) {
    return {
      solution: legal.candidate,
      diagnostic: null,
      exploredStates: legal.exploredStates,
    };
  }
  const diagnostic = await runBeam(
    request,
    control,
    true,
    legal.exploredStates,
  );
  return {
    solution: null,
    diagnostic: diagnostic.candidate,
    exploredStates: diagnostic.exploredStates,
  };
}
