import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExamplePlanButtons } from "@/features/planner/example-plan-buttons";
import { getExamplePlan } from "@/features/planner/example-plans";

afterEach(() => cleanup());

describe("example plan buttons", () => {
  it.each([
    ["Maxed Sword", "maxed_sword"],
    ["Fortune Pickaxe", "fortune_pickaxe"],
    ["Survival Boots", "survival_boots"],
  ] as const)("loads %s through a real button", async (label, id) => {
    const onLoad = vi.fn();
    render(<ExamplePlanButtons onLoad={onLoad} />);

    const button = screen.getByRole("button", { name: label });
    expect(button).toHaveAccessibleDescription();
    await userEvent.click(button);
    expect(onLoad).toHaveBeenCalledWith(getExamplePlan(id));
  });

  it("loads the focused example with the keyboard", async () => {
    const onLoad = vi.fn();
    const user = userEvent.setup();
    render(<ExamplePlanButtons onLoad={onLoad} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Maxed Sword" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onLoad).toHaveBeenCalledWith(getExamplePlan("maxed_sword"));
  });
});
