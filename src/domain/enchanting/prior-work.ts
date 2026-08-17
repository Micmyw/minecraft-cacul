export function priorWorkPenalty(priorWork: number): number {
  return 2 ** priorWork - 1;
}

export function nextPriorWork(left: number, right: number): number {
  return Math.max(left, right) + 1;
}
