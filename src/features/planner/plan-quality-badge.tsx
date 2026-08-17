import type { PlanQuality } from "@/domain/enchanting/types";

export function PlanQualityBadge({ quality }: { quality: PlanQuality }) {
  return (
    <span className={`quality-badge ${quality}`}>
      <span className="quality-dot" aria-hidden="true" />
      {quality === "exact-optimal" ? "Exact Optimal" : "Best Found"}
    </span>
  );
}
