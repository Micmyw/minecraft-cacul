import { describe, expect, it } from "vitest";
import { calculateSequentialBaseline } from "@/domain/enchanting/sequential-baseline";
import { ingredient, request } from "../fixtures/ingredients";

describe("sequential baseline", () => {
  it("applies sacrifices directly to the target in input order", () => {
    const solveRequest = request({
      sacrifices: [
        ingredient({
          id: "sharpness",
          kind: "book",
          enchantments: [{ enchantmentId: "sharpness", level: 5 }],
        }),
        ingredient({
          id: "mending",
          kind: "book",
          enchantments: [{ enchantmentId: "mending", level: 1 }],
        }),
      ],
    });

    const result = calculateSequentialBaseline(solveRequest);

    expect(result.legalInSurvival).toBe(true);
    expect(result.totalLevels).toBe(8);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].right.id).toBe("sharpness");
    expect(result.steps[1].right.id).toBe("mending");
  });

  it("returns a null comparison total when any sequential step is illegal", () => {
    const result = calculateSequentialBaseline(
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

    expect(result.legalInSurvival).toBe(false);
    expect(result.totalLevels).toBeNull();
  });
});
