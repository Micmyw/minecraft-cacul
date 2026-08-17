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
  return (
    <div className="calculate-dock">
      {calculating ? (
        <>
          <div className="progress-track" aria-label="Calculation progress">
            <span style={{ width: `${Math.max(4, progress * 100)}%` }} />
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
