"use client";

import { useState } from "react";
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
  const planKey = JSON.stringify(steps);
  const [checklist, setChecklist] = useState({
    planKey,
    completed: new Set<string>(),
  });
  const completed = checklist.planKey === planKey
    ? checklist.completed
    : new Set<string>();
  const toggleStep = (stepId: string) => {
    const next = new Set(completed);
    if (next.has(stepId)) next.delete(stepId);
    else next.add(stepId);
    setChecklist({ planKey, completed: next });
  };

  return (
    <div className="result-steps">
      <h3>Step-by-step order</h3>
      <div className="step-execution-bar">
        <div>
          <span>RUN CHECKLIST</span>
          <p role="status" aria-live="polite">
            {completed.size} of {steps.length} steps complete
          </p>
        </div>
        <progress
          aria-label="Anvil work order progress"
          max={steps.length}
          value={completed.size}
        />
        <button
          type="button"
          className="text-button"
          disabled={completed.size === 0}
          onClick={() => setChecklist({ planKey, completed: new Set() })}
        >
          Reset step checklist
        </button>
      </div>
      {steps.map((step, index) => {
        const band = costBand(step.levelCost);
        const isComplete = completed.has(step.id);
        return (
          <article
            className={`step-card ${band.className}${isComplete ? " is-complete" : ""}`}
            key={step.id}
          >
            <div className="step-card-heading">
              <div className="step-number">Step {index + 1}</div>
              <label className="step-complete-control">
                <input
                  type="checkbox"
                  checked={isComplete}
                  aria-label={`Mark step ${index + 1} complete`}
                  onChange={() => toggleStep(step.id)}
                />
                <span>{isComplete ? "Done" : "Mark done"}</span>
              </label>
            </div>
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
