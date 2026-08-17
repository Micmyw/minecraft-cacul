import type { CombineStep } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";
import { formatIngredient } from "./planner-format";

function costBand(cost: number): { className: string; label: string | null } {
  if (cost >= 40) return { className: "cost-too-expensive", label: "Too Expensive" };
  if (cost >= 36) return { className: "cost-danger", label: "Very close to the Survival limit" };
  if (cost >= 30) return { className: "cost-caution", label: "Approaching the Survival limit" };
  return { className: "cost-safe", label: null };
}

export function ResultSteps({
  steps,
  catalog,
}: {
  steps: CombineStep[];
  catalog: CatalogSnapshot;
}) {
  return (
    <div className="result-steps">
      <h3>Step-by-step order</h3>
      {steps.map((step, index) => {
        const band = costBand(step.levelCost);
        return (
          <article className={`step-card ${band.className}`} key={step.id}>
            <div className="step-number">Step {index + 1}</div>
            <div className="merge-slots">
              <div><span>Left slot</span><strong>{formatIngredient(step.left, catalog)}</strong><small>Left prior work: {step.left.priorWork}</small></div>
              <div><span>Right slot</span><strong>{formatIngredient(step.right, catalog)}</strong><small>Right prior work: {step.right.priorWork}</small></div>
            </div>
            <svg className="merge-rail" viewBox="0 0 240 42" aria-hidden="true">
              <path d="M4 5h68l28 16h40l28-16h68M120 21v16" />
              <circle cx="120" cy="21" r="4" />
            </svg>
            <div className="step-result">
              <div><span>Result</span><strong>{formatIngredient(step.result, catalog)}</strong><small>New prior work: {step.result.priorWork}</small></div>
              <div className="step-cost"><span>Cost</span><strong>{step.levelCost} levels</strong></div>
            </div>
            {band.label && <p className="cost-note">{band.label}</p>}
          </article>
        );
      })}
    </div>
  );
}
