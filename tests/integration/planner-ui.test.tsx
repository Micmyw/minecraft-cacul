import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnchantmentPicker } from "@/features/planner/enchantment-picker";
import { PlannerTabs } from "@/features/planner/planner-tabs";
import { ResultSummary } from "@/features/planner/result-summary";
import type { CatalogSnapshot } from "@/workers/protocol";

const catalog: CatalogSnapshot = {
  edition: "java",
  gameVersion: "26.2",
  items: [
    { id: "sword", name: "Sword" },
    { id: "bow", name: "Bow" },
  ],
  enchantments: [
    {
      id: "sharpness",
      name: "Sharpness",
      maxLevel: 5,
      supportedItemIds: ["sword"],
      incompatibleWith: ["smite"],
    },
    {
      id: "smite",
      name: "Smite",
      maxLevel: 5,
      supportedItemIds: ["sword"],
      incompatibleWith: ["sharpness"],
    },
    {
      id: "power",
      name: "Power",
      maxLevel: 5,
      supportedItemIds: ["bow"],
      incompatibleWith: [],
    },
  ],
};

describe("planner UI", () => {
  it("switches between Quick and Inventory tabs with real buttons", async () => {
    const onChange = vi.fn();
    render(<PlannerTabs value="quick" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Inventory Plan" }));
    expect(onChange).toHaveBeenCalledWith("inventory");
  });

  it("adds the maximum applicable enchantment level", async () => {
    const onChange = vi.fn();
    render(
      <EnchantmentPicker
        catalog={catalog}
        itemId="sword"
        selected={[]}
        onChange={onChange}
        label="Wanted enchantments"
      />,
    );
    expect(screen.queryByRole("option", { name: "Power" })).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Add enchantment"), "sharpness");
    expect(onChange).toHaveBeenCalledWith([
      { enchantmentId: "sharpness", level: 5 },
    ]);
  });

  it("explains a negative Levels Saved value in preserve mode", () => {
    render(
      <ResultSummary
        result={{
          status: "success",
          quality: "exact-optimal",
          steps: [],
          totalLevels: 40,
          highestStepCost: 20,
          finalPriorWork: 1,
          legalInSurvival: true,
          baselineTotalLevels: 35,
          levelsSaved: -5,
          warnings: [],
          statistics: { exploredStates: 10, elapsedMs: 1, exactSearch: true },
        }}
        optimizeMode="preserve-future-work"
        onCopyLink={() => {}}
        onCopySteps={() => {}}
        onStartOver={() => {}}
      />,
    );
    expect(screen.getByText("Uses 5 more levels to preserve future work.")).toBeInTheDocument();
  });
});
