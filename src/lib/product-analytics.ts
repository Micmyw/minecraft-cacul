import { analyticsConsentStorageKey } from "@/components/site-analytics";
import type { PlanStateV1, SolveResult } from "@/domain/enchanting/types";

export type ProductAnalyticsEventName =
  | "calculator_start"
  | "calculation_success"
  | "invalid_input"
  | "no_legal_plan"
  | "copy_steps"
  | "share_link"
  | "planner_mode_change"
  | "example_loaded";

export type AnalyticsPlannerMode = "quick" | "inventory";

export type AnalyticsOptimizationMode =
  | "least_total_levels"
  | "preserve_future_work";

export type AnalyticsResultQuality =
  | "exact_optimal"
  | "best_found"
  | "not_applicable";

export type AnalyticsResultStatus =
  | "not_calculated"
  | "success"
  | "invalid_input"
  | "no_legal_plan";

export type BookCountBucket = "0" | "1-3" | "4-6" | "7-8" | "9+";

export type ExampleType =
  | "maxed_sword"
  | "fortune_pickaxe"
  | "survival_boots";

export type ProductAnalyticsParams = {
  planner_mode: AnalyticsPlannerMode;
  optimization_mode: AnalyticsOptimizationMode;
  result_quality: AnalyticsResultQuality;
  result_status: AnalyticsResultStatus;
  book_count_bucket: BookCountBucket;
  example_type?: ExampleType;
};

type ProductAnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

const productionHostname = "enchantmentcalculator.com";
const exampleTypes = new Set<ExampleType>([
  "maxed_sword",
  "fortune_pickaxe",
  "survival_boots",
]);

export type ProductResultEventName = Extract<
  ProductAnalyticsEventName,
  "calculation_success" | "invalid_input" | "no_legal_plan"
>;

export function bucketBookCount(count: number): BookCountBucket {
  if (count < 1) return "0";
  if (count <= 3) return "1-3";
  if (count <= 6) return "4-6";
  if (count <= 8) return "7-8";
  return "9+";
}

export function createProductAnalyticsParams(
  state: PlanStateV1,
  result: SolveResult | null = null,
): ProductAnalyticsParams {
  const resultQuality: AnalyticsResultQuality =
    result?.status === "success" || result?.status === "no-legal-plan"
      ? result.quality === "exact-optimal"
        ? "exact_optimal"
        : "best_found"
      : "not_applicable";
  const resultStatus: AnalyticsResultStatus =
    result === null
      ? "not_calculated"
      : result.status === "invalid-input"
        ? "invalid_input"
        : result.status === "no-legal-plan"
          ? "no_legal_plan"
          : "success";

  return {
    planner_mode: state.plannerMode,
    optimization_mode:
      state.optimizeMode === "least-total-levels"
        ? "least_total_levels"
        : "preserve_future_work",
    result_quality: resultQuality,
    result_status: resultStatus,
    book_count_bucket: bucketBookCount(
      state.plannerMode === "quick"
        ? state.enchantments.length
        : state.sacrifices.length,
    ),
  };
}

export function productResultEventName(result: SolveResult): ProductResultEventName {
  if (result.status === "success") return "calculation_success";
  if (result.status === "no-legal-plan") return "no_legal_plan";
  return "invalid_input";
}

export function isMeaningfulDraftAction(
  previous: PlanStateV1,
  next: PlanStateV1,
): boolean {
  if (previous.plannerMode !== next.plannerMode) return false;
  if (previous.plannerMode === "quick" && next.plannerMode === "quick") {
    return (
      (previous.targetItemId !== next.targetItemId && next.targetItemId !== "") ||
      next.enchantments.length > previous.enchantments.length
    );
  }
  if (previous.plannerMode !== "inventory" || next.plannerMode !== "inventory") {
    return false;
  }
  if (
    (previous.target.itemId !== next.target.itemId && next.target.itemId !== null) ||
    previous.target.priorWork !== next.target.priorWork ||
    next.sacrifices.length > previous.sacrifices.length
  ) {
    return true;
  }

  const previousEnchantments = [previous.target, ...previous.sacrifices].reduce(
    (count, ingredient) => count + ingredient.enchantments.length,
    0,
  );
  const nextEnchantments = [next.target, ...next.sacrifices].reduce(
    (count, ingredient) => count + ingredient.enchantments.length,
    0,
  );
  if (nextEnchantments > previousEnchantments) return true;

  const previousPriorWork = new Map(
    previous.sacrifices.map((ingredient) => [ingredient.id, ingredient.priorWork]),
  );
  return next.sacrifices.some(
    (ingredient) => previousPriorWork.get(ingredient.id) !== ingredient.priorWork,
  );
}

export function trackProductEvent(
  name: ProductAnalyticsEventName,
  params: ProductAnalyticsParams,
): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.hostname !== productionHostname) return false;

  try {
    if (window.localStorage.getItem(analyticsConsentStorageKey) !== "accepted") {
      return false;
    }
  } catch {
    return false;
  }

  const analyticsWindow = window as ProductAnalyticsWindow;
  if (typeof analyticsWindow.gtag !== "function") return false;

  const controlledParams: ProductAnalyticsParams = {
    planner_mode: params.planner_mode,
    optimization_mode: params.optimization_mode,
    result_quality: params.result_quality,
    result_status: params.result_status,
    book_count_bucket: params.book_count_bucket,
  };
  if (params.example_type && exampleTypes.has(params.example_type)) {
    controlledParams.example_type = params.example_type;
  }

  analyticsWindow.gtag("event", name, controlledParams);
  return true;
}
