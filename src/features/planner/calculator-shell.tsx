"use client";

import { useEffect, useRef, useState } from "react";
import type { Ingredient, SolveResult } from "@/domain/enchanting/types";
import { clearSavedPlan, loadSavedPlan, savePlan } from "@/lib/local-storage";
import {
  decodePlanState,
  encodePlanState,
  planStateToSolveRequest,
  type InventoryPlanStateV1,
  type PlanStateV1,
  type QuickPlanStateV1,
} from "@/lib/share-state";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentSolverClient } from "@/workers/worker-client";
import { CalculateButton } from "./calculate-button";
import { InventoryPlanner } from "./inventory-planner";
import { OptimizationMode } from "./optimization-mode";
import { formatIngredient } from "./planner-format";
import { PlannerTabs, type PlannerMode } from "./planner-tabs";
import { QuickPlanner } from "./quick-planner";
import { ResultSteps } from "./result-steps";
import { ResultSummary } from "./result-summary";

const defaultQuick = (): QuickPlanStateV1 => ({
  schemaVersion: 1,
  plannerMode: "quick",
  optimizeMode: "least-total-levels",
  targetItemId: "",
  enchantments: [],
});

function quickToInventory(state: QuickPlanStateV1): InventoryPlanStateV1 {
  return {
    schemaVersion: 1,
    plannerMode: "inventory",
    optimizeMode: state.optimizeMode,
    target: {
      id: "target",
      kind: "target",
      itemId: state.targetItemId || null,
      enchantments: [],
      priorWork: 0,
    },
    sacrifices: state.enchantments.map((enchantment) => ({
      id: `book-${enchantment.enchantmentId}`,
      kind: "book" as const,
      itemId: null,
      enchantments: [{ ...enchantment }],
      priorWork: 0,
    })),
  };
}

function inventoryToQuick(
  state: InventoryPlanStateV1,
  catalog: CatalogSnapshot,
): QuickPlanStateV1 {
  const targetItemId = state.target.itemId ?? "";
  const selected = new Map<string, number>();
  const sources: Ingredient[] = [state.target, ...state.sacrifices];
  for (const enchantment of sources.flatMap((source) => source.enchantments)) {
    const definition = catalog.enchantments.find(
      (item) => item.id === enchantment.enchantmentId,
    );
    if (!definition?.supportedItemIds.includes(targetItemId)) continue;
    const conflicts = [...selected.keys()].some((id) =>
      definition.incompatibleWith.includes(id),
    );
    if (!conflicts) {
      selected.set(
        enchantment.enchantmentId,
        Math.max(selected.get(enchantment.enchantmentId) ?? 0, enchantment.level),
      );
    }
  }
  return {
    schemaVersion: 1,
    plannerMode: "quick",
    optimizeMode: state.optimizeMode,
    targetItemId,
    enchantments: [...selected].map(([enchantmentId, level]) => ({
      enchantmentId,
      level,
    })),
  };
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard access is unavailable.");
}

export function CalculatorShell() {
  const [catalog, setCatalog] = useState<CatalogSnapshot | null>(null);
  const [state, setState] = useState<PlanStateV1>(defaultQuick);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const clientRef = useRef<EnchantmentSolverClient | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = new EnchantmentSolverClient();
    clientRef.current = client;
    let disposed = false;
    void client.getCatalog().then((nextCatalog) => {
      if (disposed) return;
      setCatalog(nextCatalog);
      const restoreHash = () => {
        const encoded = window.location.hash.startsWith("#plan=")
          ? window.location.hash.slice(6)
          : null;
        if (encoded) {
          const decoded = decodePlanState(encoded, nextCatalog);
          if (decoded.ok) {
            setState(decoded.state);
            setError("");
          } else {
            setState(defaultQuick());
            setError(decoded.error);
          }
        } else {
          setState(loadSavedPlan() ?? defaultQuick());
        }
        setResult(null);
        setHydrated(true);
      };
      restoreHash();
      window.addEventListener("hashchange", restoreHash);
      (client as EnchantmentSolverClient & { removeHashListener?: () => void }).removeHashListener = () =>
        window.removeEventListener("hashchange", restoreHash);
    });
    return () => {
      disposed = true;
      (client as EnchantmentSolverClient & { removeHashListener?: () => void }).removeHashListener?.();
      client.terminate();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hydrated) savePlan(state);
  }, [hydrated, state]);

  const updateState = (nextState: PlanStateV1) => {
    clientRef.current?.cancelActive();
    setCalculating(false);
    setProgress(0);
    setResult(null);
    setError("");
    setState(nextState);
  };

  const changeMode = (mode: PlannerMode) => {
    if (!catalog || mode === state.plannerMode) return;
    updateState(
      mode === "inventory"
        ? quickToInventory(state as QuickPlanStateV1)
        : inventoryToQuick(state as InventoryPlanStateV1, catalog),
    );
  };

  const calculate = async () => {
    if (!clientRef.current) return;
    setCalculating(true);
    setProgress(0);
    setMessage("");
    setError("");
    try {
      const nextResult = await clientRef.current.solve(
        planStateToSolveRequest(state),
        (event) => setProgress(event.progress),
      );
      setResult(nextResult);
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError(
          caught instanceof Error
            ? caught.message
            : "The calculation stopped unexpectedly. Try again.",
        );
      }
    } finally {
      setCalculating(false);
    }
  };

  const cancel = () => {
    clientRef.current?.cancelActive();
    setCalculating(false);
    setMessage("Calculation cancelled. Your inputs are unchanged.");
  };

  const copyShareLink = async () => {
    try {
      const encoded = encodePlanState(state);
      const url = `${window.location.origin}${window.location.pathname}${window.location.search}#plan=${encoded}`;
      window.history.replaceState(null, "", `#plan=${encoded}`);
      await copyText(url);
      setMessage("Share link copied.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not copy the share link.");
    }
  };

  const copySteps = async () => {
    if (!result || !catalog || result.status === "invalid-input") return;
    const steps = result.status === "success" ? result.steps : result.blockingSteps;
    const text = steps
      .map(
        (step, index) =>
          `Step ${index + 1}\nLeft slot: ${formatIngredient(step.left, catalog)}\nRight slot: ${formatIngredient(step.right, catalog)}\nCost: ${step.levelCost} levels${step.legalInSurvival ? "" : " — Too Expensive"}\nResult: ${formatIngredient(step.result, catalog)}`,
      )
      .join("\n\n");
    try {
      await copyText(text);
      setMessage("Steps copied.");
    } catch {
      setError("Could not copy the steps. Check clipboard permission and try again.");
    }
  };

  const startOver = () => {
    updateState(defaultQuick());
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setMessage("Started a new plan.");
  };

  if (!catalog) {
    return <div className="calculator-loading" aria-live="polite">Loading the Java 26.2 catalog…</div>;
  }

  const calculateDisabled =
    state.plannerMode === "quick"
      ? !state.targetItemId || state.enchantments.length === 0
      : !state.target.itemId || state.sacrifices.length === 0;
  const shownSteps =
    result?.status === "success"
      ? result.steps
      : result?.status === "no-legal-plan"
        ? result.blockingSteps
        : [];

  return (
    <div className="calculator-shell">
      <div className="calculator-toolbar">
        <PlannerTabs value={state.plannerMode} onChange={changeMode} />
        <button
          type="button"
          className="text-button"
          onClick={() => {
            clearSavedPlan();
            setMessage("Saved plan cleared. Your current inputs remain open.");
          }}
        >
          Clear Saved Plan
        </button>
      </div>
      <div className="calculator-grid">
        <div className="input-panel">
          {state.plannerMode === "quick" ? (
            <QuickPlanner state={state} catalog={catalog} onChange={updateState} />
          ) : (
            <InventoryPlanner state={state} catalog={catalog} onChange={updateState} />
          )}
          <div className="form-section optimization-section">
            <div className="section-heading"><span>03</span><div><h3>Choose the priority</h3><p>Both modes use stable tie-breakers, so the same plan returns the same order.</p></div></div>
            <OptimizationMode
              value={state.optimizeMode}
              onChange={(optimizeMode) => updateState({ ...state, optimizeMode } as PlanStateV1)}
            />
          </div>
          <CalculateButton
            disabled={calculateDisabled}
            calculating={calculating}
            progress={progress}
            onCalculate={() => void calculate()}
            onCancel={cancel}
          />
          <p className="privacy-note">Calculation stays in this browser. No plan is sent to a server.</p>
        </div>

        <div
          className="result-panel"
          aria-busy={calculating}
          ref={resultRef}
          tabIndex={-1}
        >
          <div className="result-panel-header">
            <span>WORK ORDER / 26.2</span>
            <h2>Recommended anvil order</h2>
          </div>
          {error && <div className="inline-alert" role="alert">{error}</div>}
          {message && <div className="inline-message" role="status">{message}</div>}
          {calculating ? (
            <div className="calculating-state">
              <span className="anvil-pulse" aria-hidden="true" />
              <h3>Testing legal merge trees…</h3>
              <p>{Math.round(progress * 100)}% · You can cancel without losing inputs.</p>
            </div>
          ) : result ? (
            <>
              <ResultSummary
                result={result}
                optimizeMode={state.optimizeMode}
                onCopyLink={() => void copyShareLink()}
                onCopySteps={() => void copySteps()}
                onStartOver={startOver}
              />
              {shownSteps.length > 0 && <ResultSteps steps={shownSteps} catalog={catalog} />}
            </>
          ) : (
            <div className="empty-result">
              <svg viewBox="0 0 180 110" aria-hidden="true">
                <path d="M20 25h42l17 17h22l17-17h42M90 42v28M54 80h72M67 70h46l10 20H57z" />
              </svg>
              <h3>Your steps will appear here</h3>
              <p>Select the item and books you actually have, then calculate a work order with slot-by-slot costs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
