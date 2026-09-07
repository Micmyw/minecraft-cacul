"use client";

import { useState } from "react";
import { AnvilIcon, CheckIcon, EnchantedBookIcon, ResetIcon } from "@/components/icons";
import type { CombineStep } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";
import { formatIngredient } from "./planner-format";

function costBand(cost: number): { className: string; label: string | null; detail: string | null } {
  if (cost >= 40) return {
    className: "cost-too-expensive",
    label: "Too Expensive",
    detail: `This step costs ${cost} levels. Survival mode blocks any single anvil operation at 40 levels or more.`,
  };
  if (cost >= 36) return {
    className: "cost-danger",
    label: "Close to the limit",
    detail: "This step is legal, but it is close to the 40-level Survival limit.",
  };
  if (cost >= 30) return {
    className: "cost-caution",
    label: "Cost watch",
    detail: "This step is legal and is approaching the Survival limit.",
  };
  return { className: "cost-safe", label: null, detail: null };
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
          <ResetIcon size={15} />
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
              <div className="step-number"><AnvilIcon size={21} />Step {index + 1}</div>
              <label className="step-complete-control">
                <input
                  type="checkbox"
                  checked={isComplete}
                  aria-label={`Mark step ${index + 1} complete`}
                  onChange={() => toggleStep(step.id)}
                />
                <span>{isComplete && <CheckIcon size={15} />}{isComplete ? "Done" : "Mark done"}</span>
              </label>
            </div>
            <div className="merge-slots">
              <div className="anvil-slot left-slot"><span><i aria-hidden="true">L</i>Left slot</span><strong><AnvilIcon size={20} />{formatIngredient(step.left, catalog)}</strong><small>Left prior work: {step.left.priorWork}</small></div>
              <div className="anvil-slot right-slot"><span><i aria-hidden="true">R</i>Right slot</span><strong><EnchantedBookIcon size={20} />{formatIngredient(step.right, catalog)}</strong><small>Right prior work: {step.right.priorWork}</small></div>
            </div>
            <svg className="merge-rail" viewBox="0 0 240 42" aria-hidden="true">
              <path d="M4 5h68l28 16h40l28-16h68M120 21v16" />
              <circle cx="120" cy="21" r="4" />
            </svg>
            <div className="step-result">
              <div className="result-slot"><span>Result</span><strong><CheckIcon size={19} />{formatIngredient(step.result, catalog)}</strong><small>New prior work: {step.result.priorWork}</small></div>
              <div className="step-cost"><span>Cost</span><strong>{step.levelCost} levels</strong></div>
            </div>
            {band.label && (
              <div className="cost-note">
                <strong>{band.label}</strong>
                <span>{band.detail}</span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
