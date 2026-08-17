import type { Ingredient } from "@/domain/enchanting/types";
import { ingredient } from "./ingredients";

/**
 * Java Edition 26.2 comparison source:
 * - Mojang version manifest: https://piston-meta.mojang.com/mc/game/version_manifest_v2.json
 * - Mojang 26.2 metadata (SHA-1 dc69be58cf16ad99f4b1ae7360c9a29c8c819ca5):
 *   https://piston-meta.mojang.com/v1/packages/dc69be58cf16ad99f4b1ae7360c9a29c8c819ca5/26.2.json
 * - Official server jar (SHA-1 823e2250d24b3ddac457a60c92a6a941943fcd6a),
 *   net.minecraft.world.inventory.AnvilMenu#createResult.
 *
 * The 26.2 implementation compares equal levels before clamping to max, uses
 * max(existing, incoming) for unequal levels, charges the resulting level,
 * adds one level for each incompatible enchantment already on the left item,
 * and still applies other compatible entries from the same enchanted book.
 */
export const java262MixedBookSource = {
  gameVersion: "26.2",
  releaseNotes: "https://www.minecraft.net/en-us/article/minecraft-java-edition-26-2",
  versionManifest: "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
  versionMetadataSha1: "dc69be58cf16ad99f4b1ae7360c9a29c8c819ca5",
  serverJar: "https://piston-data.mojang.com/v1/objects/823e2250d24b3ddac457a60c92a6a941943fcd6a/server.jar",
  serverJarSha1: "823e2250d24b3ddac457a60c92a6a941943fcd6a",
  implementation: "net.minecraft.world.inventory.AnvilMenu#createResult",
} as const;

type MixedBookFixture = {
  name: string;
  target: Ingredient;
  book: Ingredient;
  expected: {
    outcome: "success" | "invalid-input";
    levelCost?: number;
    enchantments?: Ingredient["enchantments"];
    warningIncludes?: string;
  };
};

const swordWithSharpness = () =>
  ingredient({
    id: "target",
    kind: "target",
    enchantments: [{ enchantmentId: "sharpness", level: 5 }],
  });

export const java262MixedBookFixtures: readonly MixedBookFixture[] = [
  {
    name: "a book with only an enchantment conflicting with the target is unusable",
    target: swordWithSharpness(),
    book: ingredient({
      id: "smite-only",
      kind: "book",
      enchantments: [{ enchantmentId: "smite", level: 5 }],
    }),
    expected: { outcome: "invalid-input" },
  },
  {
    name: "a mixed book discards its conflicting entry but applies its valid entry",
    target: swordWithSharpness(),
    book: ingredient({
      id: "smite-and-mending",
      kind: "book",
      enchantments: [
        { enchantmentId: "smite", level: 5 },
        { enchantmentId: "mending", level: 1 },
      ],
    }),
    expected: {
      outcome: "success",
      levelCost: 3,
      enchantments: [
        { enchantmentId: "mending", level: 1 },
        { enchantmentId: "sharpness", level: 5 },
      ],
      warningIncludes: "conflicted with Sharpness V and was discarded",
    },
  },
  {
    name: "a lower-level duplicate keeps the higher target level and charges that level",
    target: swordWithSharpness(),
    book: ingredient({
      id: "sharpness-one-and-mending",
      kind: "book",
      enchantments: [
        { enchantmentId: "sharpness", level: 1 },
        { enchantmentId: "mending", level: 1 },
      ],
    }),
    expected: {
      outcome: "success",
      levelCost: 7,
      enchantments: [
        { enchantmentId: "mending", level: 1 },
        { enchantmentId: "sharpness", level: 5 },
      ],
    },
  },
  {
    name: "a repeated maximum-level enchantment stays capped and charges the maximum level",
    target: swordWithSharpness(),
    book: ingredient({
      id: "sharpness-five-and-mending",
      kind: "book",
      enchantments: [
        { enchantmentId: "sharpness", level: 5 },
        { enchantmentId: "mending", level: 1 },
      ],
    }),
    expected: {
      outcome: "success",
      levelCost: 7,
      enchantments: [
        { enchantmentId: "mending", level: 1 },
        { enchantmentId: "sharpness", level: 5 },
      ],
    },
  },
] as const;
