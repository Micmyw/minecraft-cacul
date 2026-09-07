import { AnvilIcon, ArrowRightIcon, SpinnerIcon } from "@/components/icons";

export function CalculateButton({
  disabled,
  calculating,
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
    <div className={`calculate-dock${disabled ? " is-disabled" : ""}`}>
      {calculating ? (
        <div className="calculation-progress">
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Searching valid anvil orders"
          >
            <span />
          </div>
          <p><SpinnerIcon size={18} />Checking compatibility, level cost, and prior-work penalties.</p>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel calculation
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="calculate-button"
          disabled={disabled}
          onClick={onCalculate}
        >
          <AnvilIcon size={25} />
          Calculate Anvil Order
          <ArrowRightIcon className="button-trailing-icon" size={20} />
        </button>
      )}
    </div>
  );
}
