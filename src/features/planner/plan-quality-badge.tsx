import type { PlanQuality } from "@/domain/enchanting/types";
import { CheckIcon, SparkIcon } from "@/components/icons";

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
  const Icon = quality === "exact-optimal" ? CheckIcon : SparkIcon;
  return (
    <span className={`quality-badge ${quality}`}>
      <Icon size={15} />
      {label}
    </span>
  );
}
