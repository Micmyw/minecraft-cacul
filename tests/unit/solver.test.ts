import { describe, expect, it } from "vitest";
import { solve } from "@/domain/enchanting/solver";
import { ingredient, request } from "../fixtures/ingredients";

function books(count: number) {
  return Array.from({ length: count }, (_, index) =>
    ingredient({
      id: `book-${index + 1}`,
      kind: "book",
      enchantments: [{ enchantmentId: "unbreaking", level: 3 }],
    }),
  );
}

function distinctBooks(enchantments: ReadonlyArray<readonly [string, number]>) {
  return enchantments.map(([enchantmentId, level]) =>
    ingredient({
      id: `book-${enchantmentId}`,
      kind: "book",
      enchantments: [{ enchantmentId, level }],
    }),
  );
}

const exactSwordBooks = distinctBooks([
  ["sharpness", 5],
  ["looting", 3],
  ["sweeping_edge", 3],
  ["knockback", 2],
  ["fire_aspect", 2],
  ["unbreaking", 3],
  ["mending", 1],
  ["vanishing_curse", 1],
]);

const heuristicBootsBooks = distinctBooks([
  ["protection", 4],
  ["binding_curse", 1],
  ["depth_strider", 3],
  ["feather_falling", 4],
  ["mending", 1],
  ["soul_speed", 3],
  ["thorns", 3],
  ["unbreaking", 3],
  ["vanishing_curse", 1],
]);

describe("enchantment solver", () => {
  it("returns an exact optimum through eight sacrifices", async () => {
    const result = await solve(request({ sacrifices: exactSwordBooks }));

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.quality).toBe("exact-optimal");
    expect(result.statistics.exactSearch).toBe(true);
    expect(result.steps).toHaveLength(8);
    expect(result.totalLevels).toBe(
      result.steps.reduce((total, step) => total + step.levelCost, 0),
    );
    expect(result.highestStepCost).toBe(
      Math.max(...result.steps.map((step) => step.levelCost)),
    );
    expect(new Set(exactSwordBooks.map((book) => book.enchantments[0].enchantmentId)).size).toBe(8);
    expect(result.statistics.exploredStates).toBeGreaterThan(0);
    console.info(
      `EXACT_8_METRICS elapsedMs=${result.statistics.elapsedMs} exploredStates=${result.statistics.exploredStates}`,
    );
  }, 60_000);

  it("labels nine sacrifices as deterministic Best Found", async () => {
    const solveRequest = request({
      target: ingredient({ id: "target", kind: "target", itemId: "boots" }),
      sacrifices: heuristicBootsBooks,
    });
    const first = await solve(solveRequest);
    const second = await solve(solveRequest);

    expect(first.status).toBe("success");
    expect(second.status).toBe("success");
    if (first.status !== "success" || second.status !== "success") return;
    expect(first.quality).toBe("best-found");
    expect(first.statistics.exactSearch).toBe(false);
    expect(new Set(heuristicBootsBooks.map((book) => book.enchantments[0].enchantmentId)).size).toBe(9);
    expect({ ...first, statistics: undefined }).toEqual({
      ...second,
      statistics: undefined,
    });
  }, 20_000);

  it("minimizes target prior work in preserve-future-work mode", async () => {
    const sacrifices = [
      ingredient({ id: "sharpness", kind: "book", enchantments: [{ enchantmentId: "sharpness", level: 5 }] }),
      ingredient({ id: "looting", kind: "book", enchantments: [{ enchantmentId: "looting", level: 3 }] }),
      ingredient({ id: "unbreaking", kind: "book", enchantments: [{ enchantmentId: "unbreaking", level: 3 }] }),
      ingredient({ id: "mending", kind: "book", enchantments: [{ enchantmentId: "mending", level: 1 }] }),
    ];
    const least = await solve(request({ sacrifices, optimizeMode: "least-total-levels" }));
    const preserve = await solve(request({ sacrifices, optimizeMode: "preserve-future-work" }));

    expect(least.status).toBe("success");
    expect(preserve.status).toBe("success");
    if (least.status !== "success" || preserve.status !== "success") return;
    expect(preserve.finalPriorWork).toBeLessThanOrEqual(least.finalPriorWork);
  });

  it("returns exact blocking steps when every plan is Too Expensive", async () => {
    const result = await solve(
      request({
        target: ingredient({ id: "target", kind: "target", priorWork: 5 }),
        sacrifices: [
          ingredient({
            id: "mending",
            kind: "book",
            priorWork: 3,
            enchantments: [{ enchantmentId: "mending", level: 1 }],
          }),
        ],
      }),
    );

    expect(result.status).toBe("no-legal-plan");
    if (result.status !== "no-legal-plan") return;
    expect(result.quality).toBe("exact-optimal");
    expect(result.blockingSteps).toHaveLength(1);
    expect(result.blockingSteps[0]).toMatchObject({
      levelCost: 40,
      legalInSurvival: false,
    });
  });

  it("returns a Best Found diagnostic when a heuristic search finds no legal plan", async () => {
    const result = await solve(
      request({
        target: ingredient({ id: "target", kind: "target", priorWork: 6 }),
        sacrifices: books(9).map((book) => ({ ...book, priorWork: 6 })),
      }),
    );

    expect(result.status).toBe("no-legal-plan");
    if (result.status !== "no-legal-plan") return;
    expect(result.quality).toBe("best-found");
    expect(result.statistics.exactSearch).toBe(false);
    expect(result.blockingSteps).toHaveLength(9);
    expect(result.blockingSteps.some((step) => !step.legalInSurvival)).toBe(true);
  }, 20_000);

  it("returns validation errors without starting a search", async () => {
    const result = await solve(request({ sacrifices: [] }));
    expect(result).toEqual({
      status: "invalid-input",
      errors: ["Add at least one enchanted book."],
    });
  });

  it("keeps the target result chain connected and uses every leaf once", async () => {
    const solveRequest = request({ sacrifices: books(4) });
    const result = await solve(solveRequest);
    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    const consumed = new Set(result.steps.flatMap((step) => [step.left.id, step.right.id]));
    for (const source of [solveRequest.target, ...solveRequest.sacrifices]) {
      expect(consumed.has(source.id)).toBe(true);
    }
    for (let index = 0; index < result.steps.length - 1; index += 1) {
      const producedId = result.steps[index].result.id;
      expect(
        result.steps.slice(index + 1).some(
          (step) => step.left.id === producedId || step.right.id === producedId,
        ),
      ).toBe(true);
    }
  });
});
