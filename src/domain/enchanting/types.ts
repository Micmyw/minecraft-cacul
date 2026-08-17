export type EnchantmentId = string;
export type ItemId = string;

export type EnchantmentLevel = {
  enchantmentId: EnchantmentId;
  level: number;
};

export type IngredientKind = "target" | "book";

// V1 deliberately exposes books as the only sacrifice kind. Keeping this
// alias makes a future equipment-sacrifice extension explicit and localized.
export type InventorySacrificeKind = Extract<IngredientKind, "book">;

export type Ingredient = {
  id: string;
  kind: IngredientKind;
  itemId: ItemId | null;
  enchantments: EnchantmentLevel[];
  priorWork: number;
};

export type OptimizeMode = "least-total-levels" | "preserve-future-work";

export type SolveRequest = {
  edition: "java";
  gameVersion: "26.2";
  target: Ingredient;
  sacrifices: Ingredient[];
  optimizeMode: OptimizeMode;
  survivalMaxStepCost: 39;
};

export type CombineStep = {
  id: string;
  left: Ingredient;
  right: Ingredient;
  result: Ingredient;
  levelCost: number;
  legalInSurvival: boolean;
};

export type SolveStatistics = {
  exploredStates: number;
  elapsedMs: number;
  exactSearch: boolean;
};

export type PlanQuality = "exact-optimal" | "best-found";

export type SolveResult =
  | {
      status: "success";
      quality: PlanQuality;
      steps: CombineStep[];
      totalLevels: number;
      highestStepCost: number;
      finalPriorWork: number;
      legalInSurvival: boolean;
      baselineTotalLevels: number | null;
      levelsSaved: number | null;
      warnings: string[];
      statistics: SolveStatistics;
    }
  | {
      status: "no-legal-plan";
      quality: PlanQuality;
      blockingSteps: CombineStep[];
      warnings: string[];
      statistics: SolveStatistics;
    }
  | {
      status: "invalid-input";
      errors: string[];
    };

export const EXACT_SEARCH_MAX_INGREDIENTS = 8;
export const MAX_SACRIFICES = 32;
// With at most 32 sacrifices, this keeps every reachable 2^n - 1 penalty
// within Number.MAX_SAFE_INTEGER, including a fully sequential merge chain.
export const MAX_PRIOR_WORK = 20;

export type QuickPlanStateV1 = {
  schemaVersion: 1;
  plannerMode: "quick";
  optimizeMode: OptimizeMode;
  targetItemId: string;
  enchantments: EnchantmentLevel[];
};

export type InventoryPlanStateV1 = {
  schemaVersion: 1;
  plannerMode: "inventory";
  optimizeMode: OptimizeMode;
  target: Ingredient;
  sacrifices: Ingredient[];
};

export type PlanStateV1 = QuickPlanStateV1 | InventoryPlanStateV1;

export type CatalogItem = Readonly<{
  id: string;
  name: string;
}>;

export type CatalogEnchantment = Readonly<{
  id: string;
  name: string;
  maxLevel: number;
  supportedItemIds: readonly string[];
  incompatibleWith: readonly string[];
}>;

export type CatalogSnapshot = Readonly<{
  edition: "java";
  gameVersion: "26.2";
  items: readonly CatalogItem[];
  enchantments: readonly CatalogEnchantment[];
}>;

export type SearchPhase = "exact-search" | "heuristic-search";

export type SearchProgress = {
  phase: SearchPhase;
  exploredStates: number;
  progress: number;
};

export type SolverWorkerRequest =
  | { type: "init" }
  | { type: "solve"; requestId: string; request: SolveRequest }
  | { type: "cancel"; requestId: string };

export type SolverWorkerEvent =
  | { type: "ready"; catalog: CatalogSnapshot }
  | {
      type: "progress";
      requestId: string;
      phase: SearchPhase;
      exploredStates: number;
      progress: number;
    }
  | { type: "success"; requestId: string; result: SolveResult }
  | { type: "cancelled"; requestId: string }
  | { type: "error"; requestId: string; message: string };
