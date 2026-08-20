import type { SolveRequest } from "@/domain/enchanting/types";
import { getExamplePlan } from "@/features/planner/example-plans";
import { planStateToSolveRequest } from "@/lib/share-state";

type GuideStep = {
  action: string;
  cost: number;
  leftPriorWork: number;
  rightPriorWork: number;
  resultPriorWork: number;
  combinesBooks: boolean;
};

type GuideExample = {
  title: string;
  request: SolveRequest;
  optimized: {
    summary: {
      totalLevels: number;
      highestStepCost: number;
      finalPriorWork: number;
      legalInSurvival: true;
    };
    steps: readonly GuideStep[];
  };
  sequential: {
    totalLevels: number | null;
    legalInSurvival: boolean;
    stepCosts: readonly number[];
    tooExpensiveStepCost?: number;
  };
};

export const priorWorkGuideExample = {
  title: "Fortune Pickaxe with four fresh books",
  request: planStateToSolveRequest(getExamplePlan("fortune_pickaxe").state),
  optimized: {
    summary: {
      totalLevels: 23,
      highestStepCost: 8,
      finalPriorWork: 3,
      legalInSurvival: true,
    },
    steps: [
      {
        action: "Apply Fortune III to the pickaxe",
        cost: 6,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: false,
      },
      {
        action: "Combine the Unbreaking III and Mending I books",
        cost: 2,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: true,
      },
      {
        action: "Apply the combined durability book to the pickaxe",
        cost: 7,
        leftPriorWork: 1,
        rightPriorWork: 1,
        resultPriorWork: 2,
        combinesBooks: false,
      },
      {
        action: "Apply Efficiency V last",
        cost: 8,
        leftPriorWork: 2,
        rightPriorWork: 0,
        resultPriorWork: 3,
        combinesBooks: false,
      },
    ],
  },
  sequential: {
    totalLevels: 27,
    legalInSurvival: true,
    stepCosts: [5, 7, 6, 9],
  },
} as const satisfies GuideExample;

export const tooExpensiveGuideExample = {
  title: "Survival Boots with seven fresh books",
  request: planStateToSolveRequest(getExamplePlan("survival_boots").state),
  optimized: {
    summary: {
      totalLevels: 66,
      highestStepCost: 16,
      finalPriorWork: 4,
      legalInSurvival: true,
    },
    steps: [
      {
        action: "Apply Soul Speed III to the boots",
        cost: 12,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: false,
      },
      {
        action: "Combine the Thorns III and Mending I books",
        cost: 2,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: true,
      },
      {
        action: "Apply the combined Thorns and Mending book",
        cost: 16,
        leftPriorWork: 1,
        rightPriorWork: 1,
        resultPriorWork: 2,
        combinesBooks: false,
      },
      {
        action: "Combine the Depth Strider III and Feather Falling IV books",
        cost: 4,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: true,
      },
      {
        action: "Apply the combined movement book",
        cost: 14,
        leftPriorWork: 2,
        rightPriorWork: 1,
        resultPriorWork: 3,
        combinesBooks: false,
      },
      {
        action: "Combine the Protection IV and Unbreaking III books",
        cost: 3,
        leftPriorWork: 0,
        rightPriorWork: 0,
        resultPriorWork: 1,
        combinesBooks: true,
      },
      {
        action: "Apply the combined protection book",
        cost: 15,
        leftPriorWork: 3,
        rightPriorWork: 1,
        resultPriorWork: 4,
        combinesBooks: false,
      },
    ],
  },
  sequential: {
    totalLevels: null,
    legalInSurvival: false,
    stepCosts: [4, 5, 9, 19, 27, 34, 65],
    tooExpensiveStepCost: 65,
  },
} as const satisfies GuideExample;
