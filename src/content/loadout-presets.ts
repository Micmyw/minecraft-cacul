import type { QuickPlanStateV1 } from "@/domain/enchanting/types";
import { getExamplePlan } from "@/features/planner/example-plans";

export type LoadoutPresetId =
  | "maxed_sword"
  | "fortune_pickaxe"
  | "silk_touch_pickaxe"
  | "survival_boots"
  | "infinity_bow"
  | "mending_bow"
  | "channeling_trident"
  | "riptide_trident"
  | "multishot_crossbow"
  | "density_mace";

export type LoadoutPreset = Readonly<{
  id: LoadoutPresetId;
  label: string;
  itemLabel: string;
  purpose: string;
  state: QuickPlanStateV1;
}>;

function defineLoadout(preset: LoadoutPreset): LoadoutPreset {
  const state: QuickPlanStateV1 = {
    ...preset.state,
    enchantments: preset.state.enchantments.map((enchantment) => ({
      ...enchantment,
    })),
  };
  Object.freeze(state.enchantments);
  Object.freeze(state);
  return Object.freeze({ ...preset, state });
}

function fromExample(
  id: "maxed_sword" | "fortune_pickaxe" | "survival_boots",
  itemLabel: string,
): LoadoutPreset {
  const example = getExamplePlan(id);
  return defineLoadout({
    id,
    label: example.label,
    itemLabel,
    purpose: example.description,
    state: example.state,
  });
}

function quickState(
  targetItemId: string,
  enchantments: QuickPlanStateV1["enchantments"],
): QuickPlanStateV1 {
  return {
    schemaVersion: 1,
    plannerMode: "quick",
    optimizeMode: "least-total-levels",
    targetItemId,
    enchantments,
  };
}

export const loadoutPresets: readonly LoadoutPreset[] = Object.freeze([
  fromExample("maxed_sword", "Sword"),
  fromExample("fortune_pickaxe", "Pickaxe"),
  defineLoadout({
    id: "silk_touch_pickaxe",
    label: "Silk Touch Pickaxe",
    itemLabel: "Pickaxe",
    purpose: "A utility mining build that preserves blocks instead of multiplying drops.",
    state: quickState("pickaxe", [
      { enchantmentId: "efficiency", level: 5 },
      { enchantmentId: "silk_touch", level: 1 },
      { enchantmentId: "unbreaking", level: 3 },
      { enchantmentId: "mending", level: 1 },
    ]),
  }),
  fromExample("survival_boots", "Boots"),
  defineLoadout({
    id: "infinity_bow",
    label: "Infinity Bow",
    itemLabel: "Bow",
    purpose: "A combat bow that trades Mending for a reusable normal arrow.",
    state: quickState("bow", [
      { enchantmentId: "power", level: 5 },
      { enchantmentId: "punch", level: 2 },
      { enchantmentId: "flame", level: 1 },
      { enchantmentId: "infinity", level: 1 },
      { enchantmentId: "unbreaking", level: 3 },
    ]),
  }),
  defineLoadout({
    id: "mending_bow",
    label: "Mending Bow",
    itemLabel: "Bow",
    purpose: "A repairable combat bow for players who carry their own arrows.",
    state: quickState("bow", [
      { enchantmentId: "power", level: 5 },
      { enchantmentId: "punch", level: 2 },
      { enchantmentId: "flame", level: 1 },
      { enchantmentId: "mending", level: 1 },
      { enchantmentId: "unbreaking", level: 3 },
    ]),
  }),
  defineLoadout({
    id: "channeling_trident",
    label: "Channeling Trident",
    itemLabel: "Trident",
    purpose: "A loyal ranged trident with Channeling for thunderstorms.",
    state: quickState("trident", [
      { enchantmentId: "impaling", level: 5 },
      { enchantmentId: "loyalty", level: 3 },
      { enchantmentId: "channeling", level: 1 },
      { enchantmentId: "unbreaking", level: 3 },
      { enchantmentId: "mending", level: 1 },
    ]),
  }),
  defineLoadout({
    id: "riptide_trident",
    label: "Riptide Trident",
    itemLabel: "Trident",
    purpose: "A movement-focused trident for rain and water travel.",
    state: quickState("trident", [
      { enchantmentId: "impaling", level: 5 },
      { enchantmentId: "riptide", level: 3 },
      { enchantmentId: "unbreaking", level: 3 },
      { enchantmentId: "mending", level: 1 },
    ]),
  }),
  defineLoadout({
    id: "multishot_crossbow",
    label: "Multishot Crossbow",
    itemLabel: "Crossbow",
    purpose: "A fast-loading spread-shot crossbow for groups of targets.",
    state: quickState("crossbow", [
      { enchantmentId: "quick_charge", level: 3 },
      { enchantmentId: "multishot", level: 1 },
      { enchantmentId: "unbreaking", level: 3 },
      { enchantmentId: "mending", level: 1 },
    ]),
  }),
  defineLoadout({
    id: "density_mace",
    label: "Density Mace",
    itemLabel: "Mace",
    purpose: "A smash-attack mace with Wind Burst and long-term durability.",
    state: quickState("mace", [
      { enchantmentId: "density", level: 5 },
      { enchantmentId: "wind_burst", level: 3 },
      { enchantmentId: "fire_aspect", level: 2 },
      { enchantmentId: "unbreaking", level: 3 },
      { enchantmentId: "mending", level: 1 },
    ]),
  }),
]);
