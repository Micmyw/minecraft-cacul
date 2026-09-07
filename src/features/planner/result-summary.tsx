import type { OptimizeMode, SolveResult } from "@/domain/enchanting/types";
import {
  AlertIcon,
  CheckIcon,
  CopyIcon,
  ErrorIcon,
  ResetIcon,
  ShareIcon,
} from "@/components/icons";
import { ComparisonCard } from "./comparison-card";
import { PlanQualityBadge } from "./plan-quality-badge";

export function ResultSummary({
  result,
  optimizeMode,
  onCopyLink,
  onCopySteps,
  onStartOver,
}: {
  result: SolveResult;
  optimizeMode: OptimizeMode;
  onCopyLink: () => void;
  onCopySteps: () => void;
  onStartOver: () => void;
}) {
  if (result.status === "invalid-input") {
    return (
      <div className="result-error" role="alert">
        <h3><ErrorIcon size={22} />Check your plan</h3>
        <ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </div>
    );
  }
  if (result.status === "no-legal-plan") {
    const exhaustive = result.quality === "exact-optimal";
    return (
      <div className="result-summary no-plan-summary">
        <div className="result-state-label danger-state"><ErrorIcon size={17} /> No legal plan</div>
        <div className="result-title-row">
          <h3>
            {exhaustive
              ? "No Survival-legal plan exists"
              : "No Survival-legal plan found"}
          </h3>
          <PlanQualityBadge quality={result.quality} context="search" />
        </div>
        <p className="result-context">
          {exhaustive
            ? "The exhaustive search checked every supported merge tree for these inputs."
            : "The bounded search did not find a legal order. This is not proof that no legal order exists; reduce prior work or split the plan and try again."}
        </p>
        {[...new Set(result.warnings)].map((warning) => <p className="result-warning" key={warning}>{warning}</p>)}
        <div className="result-actions">
          <button type="button" className="action-share" onClick={onCopyLink}><ShareIcon size={17} />Copy Share Link</button>
          <button type="button" className="action-copy" onClick={onCopySteps}><CopyIcon size={17} />Copy Steps</button>
          <button type="button" className="secondary-button action-reset" onClick={onStartOver}><ResetIcon size={17} />Start Over</button>
        </div>
      </div>
    );
  }
  const visibleWarnings = [...new Set(result.warnings)].filter(
    (warning) =>
      !(
        result.baselineTotalLevels === null &&
        warning === "The sequential order reaches Too Expensive."
      ),
  );
  return (
    <div className="result-summary">
      <div className="result-state-label success-state"><CheckIcon size={17} /> Survival-ready</div>
      <div className="result-title-row">
        <h3>Your anvil work order</h3>
        <PlanQualityBadge quality={result.quality} />
      </div>
      <p className="quality-explanation">
        {result.quality === "exact-optimal"
          ? "The complete search was evaluated for this plan, so no better result exists under the selected objective and tie-breakers."
          : "This is the best result found by the bounded search. A lower-cost order may still exist."}
      </p>
      {result.legalInSurvival && (
        <div className="survival-banner">
          <span className="survival-icon" aria-hidden="true"><CheckIcon size={18} /></span>
          <p><strong>Every anvil step costs 39 levels or less.</strong><span>Ready to follow in Survival.</span></p>
        </div>
      )}
      <dl className="result-metrics">
        <div><dt>Total Levels</dt><dd>{result.totalLevels}</dd></div>
        <div><dt>Highest Single Step</dt><dd>{result.highestStepCost}</dd></div>
        <div><dt>Final Prior Work</dt><dd>{result.finalPriorWork}</dd></div>
        <div><dt>Survival Legal</dt><dd>{result.legalInSurvival ? "Yes" : "No"}</dd></div>
        <div className="result-metric-wide"><dt>Levels Saved</dt><dd>{result.levelsSaved ?? "—"}</dd></div>
      </dl>
      <ComparisonCard
        optimized={result.totalLevels}
        baseline={result.baselineTotalLevels}
        levelsSaved={result.levelsSaved}
        preserveMode={optimizeMode === "preserve-future-work"}
      />
      {visibleWarnings.length > 0 && (
        <div className="warning-list">
          {visibleWarnings.map((warning) => <p key={warning}><AlertIcon size={17} />{warning}</p>)}
        </div>
      )}
      <p className="search-stat">
        Explored {result.statistics.exploredStates.toLocaleString()} states.
      </p>
      <div className="result-actions">
        <button type="button" className="action-share" onClick={onCopyLink}><ShareIcon size={17} />Copy Share Link</button>
        <button type="button" className="action-copy" onClick={onCopySteps}><CopyIcon size={17} />Copy Steps</button>
        <button type="button" className="secondary-button action-reset" onClick={onStartOver}><ResetIcon size={17} />Start Over</button>
      </div>
    </div>
  );
}
