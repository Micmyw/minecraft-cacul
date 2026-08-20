import type { QuickPlanStateV1 } from "@/lib/share-state";

export type ExamplePlanId =
  | "maxed_sword"
  | "fortune_pickaxe"
  | "survival_boots";

export type ExamplePlan = {
  id: ExamplePlanId;
  label: string;
  description: string;
  state: QuickPlanStateV1;
};

function defineExample(example: ExamplePlan): ExamplePlan {
  Object.freeze(example.state.enchantments);
  Object.freeze(example.state);
  return Object.freeze(example);
}

export const examplePlans: readonly ExamplePlan[] = Object.freeze([
  defineExample({
    id: "maxed_sword",
    label: "Maxed Sword",
    description: "Seven max-level enchantments for a complete combat sword.",
    state: {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: "least-total-levels",
      targetItemId: "sword",
      enchantments: [
        { enchantmentId: "sharpness", level: 5 },
        { enchantmentId: "looting", level: 3 },
        { enchantmentId: "sweeping_edge", level: 3 },
        { enchantmentId: "knockback", level: 2 },
        { enchantmentId: "fire_aspect", level: 2 },
        { enchantmentId: "unbreaking", level: 3 },
        { enchantmentId: "mending", level: 1 },
      ],
    },
  }),
  defineExample({
    id: "fortune_pickaxe",
    label: "Fortune Pickaxe",
    description: "A four-book mining setup built around Fortune III.",
    state: {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: "least-total-levels",
      targetItemId: "pickaxe",
      enchantments: [
        { enchantmentId: "efficiency", level: 5 },
        { enchantmentId: "fortune", level: 3 },
        { enchantmentId: "unbreaking", level: 3 },
        { enchantmentId: "mending", level: 1 },
      ],
    },
  }),
  defineExample({
    id: "survival_boots",
    label: "Survival Boots",
    description: "Seven compatible utility, protection, and durability books.",
    state: {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: "least-total-levels",
      targetItemId: "boots",
      enchantments: [
        { enchantmentId: "protection", level: 4 },
        { enchantmentId: "feather_falling", level: 4 },
        { enchantmentId: "depth_strider", level: 3 },
        { enchantmentId: "soul_speed", level: 3 },
        { enchantmentId: "thorns", level: 3 },
        { enchantmentId: "unbreaking", level: 3 },
        { enchantmentId: "mending", level: 1 },
      ],
    },
  }),
]);

export function getExamplePlan(id: ExamplePlanId): ExamplePlan {
  const example = examplePlans.find((candidate) => candidate.id === id);
  if (!example) throw new Error(`Unknown example plan: ${id}`);
  return example;
}
