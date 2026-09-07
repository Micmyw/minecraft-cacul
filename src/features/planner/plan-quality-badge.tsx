import type { PlanQuality } from "@/domain/enchanting/types";

export function PlanQualityBadge({
  quality,
  context = "result",
}: {
  quality: PlanQuality;
  context?: "result" | "search";
}) {
  const label =
    context === "search"
      ? quality === "exact-optimal"
        ? "Exhaustive Search"
        : "Bounded Search"
      : quality === "exact-optimal"
        ? "Exact Optimal"
        : "Best Found";
  return (
    <span className={`quality-badge ${quality}`}>
      <span className="quality-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
