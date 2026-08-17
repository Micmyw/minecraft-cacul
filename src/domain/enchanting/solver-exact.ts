// The subset-DP shape is adapted from the exhaustive partition approach in
// iamcal/enchant-order at commit 380c9f8639e48c6b1a668b68b6f3228753fe00fe.
// This implementation is a ground-up typed rewrite with different objectives.
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
import type { SolveRequest } from "./types";

function bitCount(value: number): number {
  let count = 0;
  while (value) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function storeCandidate(
  target: Map<string, Candidate>,
  candidate: Candidate,
  request: SolveRequest,
): void {
  const key = `${ingredientFingerprint(candidate.ingredient)}|${candidate.legal ? "legal" : "diagnostic"}`;
  const current = target.get(key);
  const comparison = candidate.legal
    ? compareCandidates(candidate, current ?? candidate, request.optimizeMode)
    : compareDiagnosticCandidates(candidate, current ?? candidate, request.optimizeMode);
  if (!current || comparison < 0) target.set(key, candidate);
}

export async function solveExact(
  request: SolveRequest,
  control: SearchControl = {},
): Promise<SearchOutcome> {
  const leaves = createLeaves(request);
  const fullMask = (1 << leaves.length) - 1;
  const candidatesByMask = Array.from(
    { length: fullMask + 1 },
    () => new Map<string, Candidate>(),
  );
  leaves.forEach((leaf, index) => {
    candidatesByMask[1 << index].set(
      `${ingredientFingerprint(leaf.ingredient)}|legal`,
      leaf,
    );
  });

  let exploredStates = 0;
  for (let mask = 1; mask <= fullMask; mask += 1) {
    if (bitCount(mask) < 2) continue;
    const target = candidatesByMask[mask];
    for (
      let leftMask = (mask - 1) & mask;
      leftMask > 0;
      leftMask = (leftMask - 1) & mask
    ) {
      const rightMask = mask ^ leftMask;
      if (rightMask === 0) continue;
      for (const left of candidatesByMask[leftMask].values()) {
        for (const right of candidatesByMask[rightMask].values()) {
          exploredStates += 1;
          const merged = mergeCandidates(
            left,
            right,
            request.survivalMaxStepCost,
          );
          if (merged) storeCandidate(target, merged, request);
          if (exploredStates % 512 === 0) {
            await checkpoint(control, {
              phase: "exact-search",
              exploredStates,
              progress: mask / fullMask,
            });
          }
        }
      }
    }
  }

  await checkpoint(control, {
    phase: "exact-search",
    exploredStates,
    progress: 1,
  });
  const finalCandidates = [...candidatesByMask[fullMask].values()].filter(
    (candidate) => candidate.ingredient.kind === "target",
  );
  const legal = finalCandidates
    .filter((candidate) => candidate.legal)
    .sort((left, right) => compareCandidates(left, right, request.optimizeMode))[0] ?? null;
  const diagnostic = finalCandidates
    .filter((candidate) => !candidate.legal)
    .sort((left, right) =>
      compareDiagnosticCandidates(left, right, request.optimizeMode),
    )[0] ?? null;
  return { solution: legal, diagnostic, exploredStates };
}
