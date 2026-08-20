import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EnchantmentLevel } from "@/domain/enchanting/types";
import { EnchantmentSearch } from "@/features/planner/enchantment-search";
import { QuickPlanner } from "@/features/planner/quick-planner";
import type { QuickPlanStateV1 } from "@/lib/share-state";
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
    {
      id: "mending",
      name: "Mending",
      maxLevel: 1,
      supportedItemIds: ["sword", "bow"],
      incompatibleWith: [],
    },
    {
      id: "sharpness",
      name: "Sharpness",
      maxLevel: 5,
      supportedItemIds: ["sword"],
      incompatibleWith: ["smite"],
    },
  ],
};

function renderSearch({
  itemId = "sword",
  selected = [],
  allowAll = false,
  onSelect = vi.fn(),
}: {
  itemId?: string | null;
  selected?: EnchantmentLevel[];
  allowAll?: boolean;
  onSelect?: (enchantmentId: string) => void;
} = {}) {
  render(
    <EnchantmentSearch
      catalog={catalog}
      itemId={itemId}
      selected={selected}
      allowAll={allowAll}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

afterEach(() => cleanup());

describe("searchable enchantment picker", () => {
  it("filters by case-insensitive display-name substring in alphabetic order", async () => {
    renderSearch();
    const input = screen.getByRole("searchbox", { name: "Add enchantment" });
    await userEvent.click(input);
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "MendingMax level: I",
      "SharpnessMax level: V",
      "SmiteMax level: V",
    ]);

    await userEvent.type(input, "MiTe");
    expect(screen.getByRole("button", { name: /Smite.*Max level: V/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Sharpness/i })).not.toBeInTheDocument();
  });

  it("excludes selected entries and disables incompatible results", async () => {
    renderSearch({ selected: [{ enchantmentId: "sharpness", level: 5 }] });
    await userEvent.click(screen.getByRole("searchbox", { name: "Add enchantment" }));

    expect(screen.queryByRole("button", { name: /Sharpness/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Smite.*Incompatible/i })).toBeDisabled();
  });

  it("filters to the target item unless allowAll exposes mixed-book options", async () => {
    const first = renderSearch();
    await userEvent.click(screen.getByRole("searchbox", { name: "Add enchantment" }));
    expect(screen.queryByRole("button", { name: /Power/i })).not.toBeInTheDocument();
    cleanup();

    renderSearch({ allowAll: true });
    await userEvent.click(screen.getByRole("searchbox", { name: "Add enchantment" }));
    expect(screen.getByRole("button", { name: /Power.*Max level: V/i })).toBeEnabled();
    expect(first.onSelect).not.toHaveBeenCalled();
  });

  it("shows the no-target and no-match states", async () => {
    renderSearch({ itemId: null });
    expect(screen.getByRole("searchbox", { name: "Add enchantment" })).toBeDisabled();
    expect(screen.getByText("Choose a target item first.")).toBeVisible();
    cleanup();

    renderSearch();
    const input = screen.getByRole("searchbox", { name: "Add enchantment" });
    await userEvent.type(input, "not in catalog");
    expect(screen.getByText("No enchantments match your search.")).toBeVisible();
  });

  it("clears and closes on Escape", async () => {
    renderSearch();
    const input = screen.getByRole("searchbox", { name: "Add enchantment" });
    await userEvent.type(input, "sharp");
    expect(screen.getByRole("button", { name: /Sharpness/i })).toBeVisible();

    await userEvent.keyboard("{Escape}");
    expect(input).toHaveValue("");
    expect(screen.queryByRole("button", { name: /Sharpness/i })).not.toBeInTheDocument();
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("selects the focused result with %s and clears the query", async (_, key) => {
    const onSelect = vi.fn();
    renderSearch({ onSelect });
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox", { name: "Add enchantment" });
    await user.type(input, "sharp");
    await user.tab();
    expect(screen.getByRole("button", { name: /Sharpness/i })).toHaveFocus();
    await user.keyboard(key);

    expect(onSelect).toHaveBeenCalledWith("sharpness");
    expect(input).toHaveValue("");
    expect(screen.queryByRole("button", { name: /Sharpness/i })).not.toBeInTheDocument();
  });

  it("keeps the parent target-change cleanup behavior", async () => {
    function Harness() {
      const [state, setState] = useState<QuickPlanStateV1>({
        schemaVersion: 1,
        plannerMode: "quick",
        optimizeMode: "least-total-levels",
        targetItemId: "sword",
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
      });
      return (
        <QuickPlanner
          state={state}
          catalog={catalog}
          onChange={setState}
          onLoadExample={() => {}}
        />
      );
    }

    render(<Harness />);
    expect(screen.getByText("Sharpness")).toBeVisible();
    await userEvent.selectOptions(screen.getByLabelText("Target item"), "bow");
    expect(screen.queryByText("Sharpness")).not.toBeInTheDocument();
  });
});
