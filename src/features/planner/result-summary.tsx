import type { OptimizeMode, SolveResult } from "@/domain/enchanting/types";
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
        <h3>Check your plan</h3>
        <ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
      </div>
    );
  }
  if (result.status === "no-legal-plan") {
    return (
      <div className="result-summary">
        <div className="result-title-row">
          <h3>No Survival-legal plan</h3>
          <PlanQualityBadge quality={result.quality} />
        </div>
        {result.warnings.map((warning) => <p className="result-warning" key={warning}>{warning}</p>)}
        <div className="result-actions">
          <button type="button" onClick={onCopyLink}>Copy Share Link</button>
          <button type="button" onClick={onCopySteps}>Copy Steps</button>
          <button type="button" className="secondary-button" onClick={onStartOver}>Start Over</button>
        </div>
      </div>
    );
  }
  return (
    <div className="result-summary">
      <div className="result-title-row">
        <h3>Your anvil work order</h3>
        <PlanQualityBadge quality={result.quality} />
      </div>
      <dl className="result-metrics">
        <div><dt>Total Levels</dt><dd>{result.totalLevels}</dd></div>
        <div><dt>Highest Single Step</dt><dd>{result.highestStepCost}</dd></div>
        <div><dt>Final Prior Work</dt><dd>{result.finalPriorWork}</dd></div>
        <div><dt>Survival Legal</dt><dd>{result.legalInSurvival ? "Yes" : "No"}</dd></div>
        <div><dt>Levels Saved</dt><dd>{result.levelsSaved ?? "—"}</dd></div>
      </dl>
      <ComparisonCard
        optimized={result.totalLevels}
        baseline={result.baselineTotalLevels}
        levelsSaved={result.levelsSaved}
        preserveMode={optimizeMode === "preserve-future-work"}
      />
      {result.warnings.length > 0 && (
        <div className="warning-list">
          {result.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      )}
      <p className="search-stat">
        Explored {result.statistics.exploredStates.toLocaleString()} states.
      </p>
      <div className="result-actions">
        <button type="button" onClick={onCopyLink}>Copy Share Link</button>
        <button type="button" onClick={onCopySteps}>Copy Steps</button>
        <button type="button" className="secondary-button" onClick={onStartOver}>Start Over</button>
      </div>
    </div>
  );
}
