import type { Ingredient, SolveRequest } from "@/domain/enchanting/types";

export function ingredient(
  overrides: Partial<Ingredient> & Pick<Ingredient, "id" | "kind">,
): Ingredient {
  const { id, kind, ...rest } = overrides;
  return {
    id,
    kind,
    itemId: kind === "book" ? null : "sword",
    enchantments: [],
    priorWork: 0,
    ...rest,
  };
}

export function request(overrides: Partial<SolveRequest> = {}): SolveRequest {
  return {
    edition: "java",
    gameVersion: "26.2",
    target: ingredient({ id: "target", kind: "target" }),
    sacrifices: [
      ingredient({
        id: "book-mending",
        kind: "book",
        enchantments: [{ enchantmentId: "mending", level: 1 }],
      }),
    ],
    optimizeMode: "least-total-levels",
    survivalMaxStepCost: 39,
    ...overrides,
  };
}
