import type { KeyboardEvent } from "react";

export type PlannerMode = "quick" | "inventory";

const tabs = [
  ["quick", "Quick Plan"],
  ["inventory", "Inventory Plan"],
] as const;

export function PlannerTabs({
  value,
  onChange,
}: {
  value: PlannerMode;
  onChange: (mode: PlannerMode) => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, mode: PlannerMode) => {
    const currentIndex = tabs.findIndex(([candidate]) => candidate === mode);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextMode = tabs[nextIndex][0];
    onChange(nextMode);
    document.getElementById(`planner-tab-${nextMode}`)?.focus();
  };

  return (
    <div className="planner-tabs" role="tablist" aria-label="Planner mode">
      {tabs.map(([mode, label]) => (
        <button
          key={mode}
          id={`planner-tab-${mode}`}
          type="button"
          role="tab"
          aria-selected={value === mode}
          aria-controls={`planner-panel-${mode}`}
          tabIndex={value === mode ? 0 : -1}
          className="planner-tab"
          onClick={() => onChange(mode)}
          onKeyDown={(event) => handleKeyDown(event, mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
