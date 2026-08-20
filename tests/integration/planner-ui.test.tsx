// @vitest-environment-options {"url":"https://enchantmentcalculator.com/"}

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyticsConsentStorageKey } from "@/components/site-analytics";
import type { SolveResult } from "@/domain/enchanting/types";
import { CalculatorShell } from "@/features/planner/calculator-shell";
import { EnchantmentPicker } from "@/features/planner/enchantment-picker";
import { PlannerTabs } from "@/features/planner/planner-tabs";
import { ResultSummary } from "@/features/planner/result-summary";
import { ResultSteps } from "@/features/planner/result-steps";
import { formatStepsForClipboard } from "@/features/planner/planner-format";
import type { CombineStep } from "@/domain/enchanting/types";
import {
  createDefaultPlannerDrafts,
  SAVED_PLAN_KEY,
} from "@/lib/local-storage";
import type { CatalogSnapshot } from "@/workers/protocol";

const workerMocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  solve: vi.fn(),
  cancelActive: vi.fn(),
  terminate: vi.fn(),
}));

vi.mock("@/workers/worker-client", () => ({
  EnchantmentSolverClient: class {
    getCatalog = workerMocks.getCatalog;
    solve = workerMocks.solve;
    cancelActive = workerMocks.cancelActive;
    terminate = workerMocks.terminate;
  },
}));

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

const successResult: SolveResult = {
  status: "success",
  quality: "exact-optimal",
  steps: [],
  totalLevels: 12,
  highestStepCost: 7,
  finalPriorWork: 2,
  legalInSurvival: true,
  baselineTotalLevels: 15,
  levelsSaved: 3,
  warnings: [],
  statistics: { exploredStates: 10, elapsedMs: 1, exactSearch: true },
};

afterEach(() => cleanup());

function saveCalculatorDrafts(plannerMode: "quick" | "inventory" = "quick") {
  const drafts = createDefaultPlannerDrafts();
  drafts.plannerMode = plannerMode;
  drafts.quick = {
    ...drafts.quick,
    targetItemId: "sword",
    enchantments: [{ enchantmentId: "sharpness", level: 5 }],
  };
  drafts.inventory = {
    ...drafts.inventory,
    target: { ...drafts.inventory.target, itemId: "sword" },
    sacrifices: [
      {
        id: "book-1",
        kind: "book",
        itemId: null,
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
        priorWork: 2,
      },
    ],
  };
  localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify(drafts));
}

function analyticsCalls() {
  return analyticsMock().mock.calls;
}

function analyticsMock() {
  return (window as unknown as { gtag: ReturnType<typeof vi.fn> }).gtag;
}

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

  it("shows prior work for both slots and the result in UI and copied text", () => {
    const step: CombineStep = {
      id: "step-1",
      left: {
        id: "target",
        kind: "target",
        itemId: "sword",
        enchantments: [],
        priorWork: 1,
      },
      right: {
        id: "book",
        kind: "book",
        itemId: null,
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
        priorWork: 2,
      },
      result: {
        id: "(target+book)",
        kind: "target",
        itemId: "sword",
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
        priorWork: 3,
      },
      levelCost: 8,
      legalInSurvival: true,
    };

    render(<ResultSteps steps={[step]} catalog={catalog} />);
    expect(screen.getByText("Left prior work: 1")).toBeInTheDocument();
    expect(screen.getByText("Right prior work: 2")).toBeInTheDocument();
    expect(screen.getByText("New prior work: 3")).toBeInTheDocument();

    expect(formatStepsForClipboard([step], catalog)).toContain(
      "Left prior work: 1\nRight slot: Book — Sharpness V\nRight prior work: 2",
    );
    expect(formatStepsForClipboard([step], catalog)).toContain(
      "New prior work: 3",
    );
  });
});

describe("calculator product analytics", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    localStorage.clear();
    localStorage.setItem(analyticsConsentStorageKey, "accepted");
    (window as Window & { gtag?: ReturnType<typeof vi.fn> }).gtag = vi.fn();
    workerMocks.getCatalog.mockResolvedValue(catalog);
    workerMocks.solve.mockResolvedValue(successResult);
    workerMocks.cancelActive.mockClear();
    workerMocks.terminate.mockClear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("emits exactly one success result event for one Calculate action", async () => {
    saveCalculatorDrafts("quick");
    render(<CalculatorShell />);

    await userEvent.click(await screen.findByRole("button", { name: /Calculate/i }));
    await screen.findByText("Exact Optimal");

    expect(analyticsCalls()).toEqual([
      ["event", "calculation_success", {
        planner_mode: "quick",
        optimization_mode: "least_total_levels",
        result_quality: "exact_optimal",
        result_status: "success",
        book_count_bucket: "1-3",
      }],
    ]);
  });

  it("starts each planner mode once only after a meaningful user draft action", async () => {
    render(<CalculatorShell />);
    const quickTarget = await screen.findByLabelText("Target item");
    expect(analyticsCalls()).toHaveLength(0);

    await userEvent.selectOptions(quickTarget, "sword");
    await userEvent.selectOptions(quickTarget, "bow");
    expect(analyticsCalls().filter((call) => call[1] === "calculator_start")).toEqual([
      ["event", "calculator_start", expect.objectContaining({
        planner_mode: "quick",
        result_status: "not_calculated",
      })],
    ]);

    await userEvent.click(screen.getByRole("tab", { name: "Inventory Plan" }));
    const inventoryTarget = screen.getByLabelText("Target item");
    await userEvent.selectOptions(inventoryTarget, "sword");
    expect(analyticsCalls().filter((call) => call[1] === "calculator_start")).toEqual([
      ["event", "calculator_start", expect.objectContaining({ planner_mode: "quick" })],
      ["event", "calculator_start", expect.objectContaining({ planner_mode: "inventory" })],
    ]);
  });

  it("loads an example into Quick only and emits its controlled analytics events", async () => {
    saveCalculatorDrafts("quick");
    render(<CalculatorShell />);
    const urlBeforeLoad = window.location.href;
    await userEvent.click(await screen.findByRole("button", { name: "Maxed Sword" }));

    expect(screen.getByLabelText("Target item")).toHaveValue("sword");
    expect(window.location.href).toBe(urlBeforeLoad);
    expect(analyticsCalls()).toContainEqual([
      "event",
      "example_loaded",
      expect.objectContaining({
        planner_mode: "quick",
        example_type: "maxed_sword",
      }),
    ]);
    expect(analyticsCalls().filter((call) => call[1] === "calculator_start")).toHaveLength(1);

    await userEvent.click(screen.getByRole("tab", { name: "Inventory Plan" }));
    expect(document.querySelector<HTMLInputElement>("#book-1-prior-work")).toHaveValue(2);
  });

  it("maps invalid input to invalid_input and never calculation_success", async () => {
    saveCalculatorDrafts("quick");
    workerMocks.solve.mockResolvedValueOnce({
      status: "invalid-input",
      errors: ["Invalid plan"],
    } satisfies SolveResult);
    render(<CalculatorShell />);

    await userEvent.click(await screen.findByRole("button", { name: /Calculate/i }));
    await screen.findByText("Invalid plan");

    expect(analyticsCalls()).toContainEqual([
      "event",
      "invalid_input",
      {
        planner_mode: "quick",
        optimization_mode: "least_total_levels",
        result_quality: "not_applicable",
        result_status: "invalid_input",
        book_count_bucket: "1-3",
      },
    ]);
    expect(analyticsCalls().some((call) => call[1] === "calculation_success")).toBe(false);
  });

  it("maps a blocked solve to no_legal_plan with Best Found quality", async () => {
    saveCalculatorDrafts("quick");
    workerMocks.solve.mockResolvedValueOnce({
      status: "no-legal-plan",
      quality: "best-found",
      blockingSteps: [],
      warnings: ["Every final step costs at least 40 levels."],
      statistics: { exploredStates: 20, elapsedMs: 2, exactSearch: false },
    } satisfies SolveResult);
    render(<CalculatorShell />);

    await userEvent.click(await screen.findByRole("button", { name: /Calculate/i }));
    await screen.findByText("No Survival-legal plan");

    expect(analyticsCalls()).toContainEqual([
      "event",
      "no_legal_plan",
      expect.objectContaining({
        result_quality: "best_found",
        result_status: "no_legal_plan",
      }),
    ]);
  });

  it("emits copy_steps only after clipboard success", async () => {
    saveCalculatorDrafts("quick");
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"))
      .mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CalculatorShell />);
    await userEvent.click(await screen.findByRole("button", { name: /Calculate/i }));
    await screen.findByText("Exact Optimal");
    analyticsMock().mockClear();

    await userEvent.click(screen.getByRole("button", { name: "Copy Steps" }));
    await screen.findByText(/Could not copy the steps/i);
    expect(analyticsCalls()).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "Copy Steps" }));
    await screen.findByText("Steps copied.");
    expect(analyticsCalls()).toContainEqual([
      "event",
      "copy_steps",
      expect.objectContaining({ planner_mode: "quick", result_status: "success" }),
    ]);
  });

  it("emits share_link only after the share URL reaches the clipboard", async () => {
    saveCalculatorDrafts("quick");
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"))
      .mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CalculatorShell />);
    await userEvent.click(await screen.findByRole("button", { name: /Calculate/i }));
    await screen.findByText("Exact Optimal");
    analyticsMock().mockClear();

    await userEvent.click(screen.getByRole("button", { name: "Copy Share Link" }));
    await screen.findByText(/Could not copy the share link/i);
    expect(analyticsCalls()).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "Copy Share Link" }));
    await screen.findByText("Share link copied.");
    expect(analyticsCalls()).toContainEqual([
      "event",
      "share_link",
      expect.objectContaining({ planner_mode: "quick", result_status: "success" }),
    ]);
  });

  it("uses the active planner mode for mode-change and result events", async () => {
    saveCalculatorDrafts("quick");
    render(<CalculatorShell />);
    await screen.findByRole("button", { name: /Calculate/i });

    await userEvent.click(screen.getByRole("tab", { name: "Inventory Plan" }));
    await waitFor(() => expect(analyticsCalls()).toContainEqual([
      "event",
      "planner_mode_change",
      expect.objectContaining({
        planner_mode: "inventory",
        result_status: "not_calculated",
      }),
    ]));

    analyticsMock().mockClear();
    await userEvent.click(screen.getByRole("button", { name: /Calculate/i }));
    await screen.findByText("Exact Optimal");
    expect(analyticsCalls()).toContainEqual([
      "event",
      "calculation_success",
      expect.objectContaining({ planner_mode: "inventory" }),
    ]);
  });
});
