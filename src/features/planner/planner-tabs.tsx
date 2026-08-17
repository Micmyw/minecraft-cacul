export type PlannerMode = "quick" | "inventory";

export function PlannerTabs({
  value,
  onChange,
}: {
  value: PlannerMode;
  onChange: (mode: PlannerMode) => void;
}) {
  return (
    <div className="planner-tabs" role="tablist" aria-label="Planner mode">
      {([
        ["quick", "Quick Plan"],
        ["inventory", "Inventory Plan"],
      ] as const).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={value === mode}
          className="planner-tab"
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
