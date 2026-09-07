import { describe, expect, it } from "vitest";
import { loadoutPresets } from "@/content/loadout-presets";
import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { solve } from "@/domain/enchanting/solver";
import { planStateToSolveRequest } from "@/lib/share-state";
import { createCatalogSnapshot } from "@/workers/protocol";

describe("Java 26.2 reference catalog", () => {
  it("pins the live Mojang artifacts used for the September verification", () => {
    expect(dataMetadata).toMatchObject({
      gameVersion: "26.2",
      verifiedAt: "2026-09-07",
      dataPackVersion: "107.1",
      versionMetadataSha1: "3592ebc61c6b6c33bb8228fe5a9e90221df0be68",
      clientJarSha1: "2dc72797acbc1b63fc16a11c4ac393605f453754",
      manifestUrl:
        "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
    });
  });

  it("keeps every catalog relation complete and internally consistent", () => {
    expect(enchantments).toHaveLength(43);
    expect(items).toHaveLength(26);
    expect(new Set(enchantments.map(({ id }) => id)).size).toBe(enchantments.length);
    expect(new Set(items.map(({ id }) => id)).size).toBe(items.length);

    const itemIds = new Set<string>(items.map(({ id }) => id));
    const enchantmentIds = new Set<string>(enchantments.map(({ id }) => id));
    for (const enchantment of enchantments) {
      expect(enchantment.maxLevel, enchantment.id).toBeGreaterThanOrEqual(1);
      expect(enchantment.anvilCost, enchantment.id).toBeGreaterThanOrEqual(1);
      expect(enchantment.bookCost, enchantment.id).toBeGreaterThanOrEqual(1);
      expect(enchantment.supportedItemIds.length, enchantment.id).toBeGreaterThan(0);
      for (const itemId of enchantment.supportedItemIds) {
        expect(itemIds.has(itemId), `${enchantment.id} -> ${itemId}`).toBe(true);
      }
      for (const incompatibleId of enchantment.incompatibleWith) {
        expect(enchantmentIds.has(incompatibleId), incompatibleId).toBe(true);
        const inverse = enchantments.find(({ id }) => id === incompatibleId);
        expect(inverse?.incompatibleWith, `${incompatibleId} -> ${enchantment.id}`).toContain(
          enchantment.id,
        );
      }
    }

    expect(enchantments.filter(({ treasure }) => treasure)).toHaveLength(7);
    expect(enchantments.filter(({ curse }) => curse).map(({ id }) => id).sort()).toEqual([
      "binding_curse",
      "vanishing_curse",
    ]);
    expect(enchantments.filter(({ tradeable }) => tradeable)).toHaveLength(40);
    expect(enchantments.filter(({ inEnchantingTable }) => inEnchantingTable)).toHaveLength(36);
    expect(
      Object.fromEntries(
        [1, 2, 5, 10].map((weight) => [
          weight,
          enchantments.filter((enchantment) => enchantment.weight === weight).length,
        ]),
      ),
    ).toEqual({ 1: 8, 2: 19, 5: 11, 10: 5 });
  });
});

describe("reference loadout presets", () => {
  it("publishes ten distinct player-intent builds", () => {
    expect(loadoutPresets.map(({ id }) => id)).toEqual([
      "maxed_sword",
      "fortune_pickaxe",
      "silk_touch_pickaxe",
      "survival_boots",
      "infinity_bow",
      "mending_bow",
      "channeling_trident",
      "riptide_trident",
      "multishot_crossbow",
      "density_mace",
    ]);
  });

  it.each(loadoutPresets)("solves $label exactly and legally", async (preset) => {
    const catalog = createCatalogSnapshot();
    const request = planStateToSolveRequest(preset.state);

    expect(request.sacrifices.length).toBeLessThanOrEqual(8);
    for (const selected of preset.state.enchantments) {
      const definition = catalog.enchantments.find(
        ({ id }) => id === selected.enchantmentId,
      );
      expect(definition, selected.enchantmentId).toBeDefined();
      expect(definition?.supportedItemIds).toContain(preset.state.targetItemId);
      expect(selected.level).toBeLessThanOrEqual(definition?.maxLevel ?? 0);
    }

    const result = await solve(request);
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.quality).toBe("exact-optimal");
    expect(result.legalInSurvival).toBe(true);
    expect(result.steps).toHaveLength(request.sacrifices.length);
  }, 30_000);
});
