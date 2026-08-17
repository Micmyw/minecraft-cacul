import type { OptimizeMode } from "@/domain/enchanting/types";

export function OptimizationMode({
  value,
  onChange,
}: {
  value: OptimizeMode;
  onChange: (mode: OptimizeMode) => void;
}) {
  return (
    <fieldset className="optimization-mode">
      <legend>Optimize for</legend>
      <label>
        <input
          type="radio"
          name="optimize-mode"
          checked={value === "least-total-levels"}
          onChange={() => onChange("least-total-levels")}
        />
        <span><strong>Least total levels</strong><small>Spend the fewest levels across every step.</small></span>
      </label>
      <label>
        <input
          type="radio"
          name="optimize-mode"
          checked={value === "preserve-future-work"}
          onChange={() => onChange("preserve-future-work")}
        />
        <span><strong>Preserve future work</strong><small>Keep the final item&apos;s prior work as low as possible.</small></span>
      </label>
    </fieldset>
  );
}
