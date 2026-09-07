export function CalculateButton({
  disabled,
  calculating,
  progress,
  onCalculate,
  onCancel,
}: {
  disabled: boolean;
  calculating: boolean;
  progress: number;
  onCalculate: () => void;
  onCancel: () => void;
}) {
  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className={`calculate-dock${disabled ? " is-disabled" : ""}`}>
      {calculating ? (
        <>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Calculation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <span style={{ width: `${Math.max(4, progressPercent)}%` }} />
          </div>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel calculation
          </button>
        </>
      ) : (
        <button
          type="button"
          className="calculate-button"
          disabled={disabled}
          onClick={onCalculate}
        >
          Calculate Anvil Order
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}
