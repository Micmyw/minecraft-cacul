"use client";

import { useEffect, useRef, useState } from "react";
import type { SolveResult } from "@/domain/enchanting/types";
import {
  clearSavedPlan,
  createDefaultPlannerDrafts,
  loadSavedPlan,
  savePlan,
  type PlannerDraftsV2,
} from "@/lib/local-storage";
import {
  decodePlanState,
  encodePlanState,
  planStateToSolveRequest,
  type PlanStateV1,
} from "@/lib/share-state";
import {
  createProductAnalyticsParams,
  isMeaningfulDraftAction,
  productResultEventName,
  trackProductEvent,
} from "@/lib/product-analytics";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentSolverClient } from "@/workers/worker-client";
import { CalculateButton } from "./calculate-button";
import type { ExamplePlan } from "./example-plans";
import { InventoryPlanner } from "./inventory-planner";
import { OptimizationMode } from "./optimization-mode";
import { formatStepsForClipboard } from "./planner-format";
import { PlannerTabs, type PlannerMode } from "./planner-tabs";
import { QuickPlanner } from "./quick-planner";
import { ResultSteps } from "./result-steps";
import { ResultSummary } from "./result-summary";

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
  const [drafts, setDrafts] = useState<PlannerDraftsV2>(createDefaultPlannerDrafts);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const clientRef = useRef<EnchantmentSolverClient | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const startedModesRef = useRef(new Set<PlannerMode>());
  const state: PlanStateV1 =
    drafts.plannerMode === "quick" ? drafts.quick : drafts.inventory;

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
            const existing =
              loadSavedPlan(nextCatalog) ?? createDefaultPlannerDrafts();
            setDrafts(
              decoded.state.plannerMode === "quick"
                ? { ...existing, plannerMode: "quick", quick: decoded.state }
                : { ...existing, plannerMode: "inventory", inventory: decoded.state },
            );
            setError("");
          } else {
            setDrafts(createDefaultPlannerDrafts());
            setError(decoded.error);
          }
        } else {
          setDrafts(loadSavedPlan(nextCatalog) ?? createDefaultPlannerDrafts());
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
    if (!hydrated) return;
    const saved = savePlan(drafts);
    if (!saved.ok) {
      queueMicrotask(() => setError(saved.error));
    }
  }, [drafts, hydrated]);

  const markPlannerStarted = (nextState: PlanStateV1) => {
    if (startedModesRef.current.has(nextState.plannerMode)) return;
    startedModesRef.current.add(nextState.plannerMode);
    trackProductEvent(
      "calculator_start",
      createProductAnalyticsParams(nextState),
    );
  };

  const updateState = (nextState: PlanStateV1) => {
    if (isMeaningfulDraftAction(state, nextState)) {
      markPlannerStarted(nextState);
    }
    clientRef.current?.cancelActive();
    setCalculating(false);
    setProgress(0);
    setResult(null);
    setError("");
    setDrafts((current) =>
      nextState.plannerMode === "quick"
        ? { ...current, plannerMode: "quick", quick: nextState }
        : { ...current, plannerMode: "inventory", inventory: nextState },
    );
  };

  const loadExample = (example: ExamplePlan) => {
    const nextState = {
      ...example.state,
      enchantments: example.state.enchantments.map((enchantment) => ({
        ...enchantment,
      })),
    };
    markPlannerStarted(nextState);
    updateState(nextState);
    trackProductEvent("example_loaded", {
      ...createProductAnalyticsParams(nextState),
      example_type: example.id,
    });
  };

  const changeMode = (mode: PlannerMode) => {
    if (mode === drafts.plannerMode) return;
    const nextState = mode === "quick" ? drafts.quick : drafts.inventory;
    trackProductEvent(
      "planner_mode_change",
      createProductAnalyticsParams(nextState),
    );
    clientRef.current?.cancelActive();
    setCalculating(false);
    setProgress(0);
    setResult(null);
    setError("");
    setDrafts((current) => ({ ...current, plannerMode: mode }));
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
      trackProductEvent(
        productResultEventName(nextResult),
        createProductAnalyticsParams(state, nextResult),
      );
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
      trackProductEvent("share_link", createProductAnalyticsParams(state, result));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not copy the share link.");
    }
  };

  const copySteps = async () => {
    if (!result || !catalog || result.status === "invalid-input") return;
    const steps = result.status === "success" ? result.steps : result.blockingSteps;
    const text = formatStepsForClipboard(steps, catalog);
    try {
      await copyText(text);
      setMessage("Steps copied.");
      trackProductEvent("copy_steps", createProductAnalyticsParams(state, result));
    } catch {
      setError("Could not copy the steps. Check clipboard permission and try again.");
    }
  };

  const startOver = () => {
    const empty = createDefaultPlannerDrafts();
    updateState(
      drafts.plannerMode === "quick" ? empty.quick : empty.inventory,
    );
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
        <PlannerTabs value={drafts.plannerMode} onChange={changeMode} />
        <button
          type="button"
          className="text-button"
          onClick={() => {
            const cleared = clearSavedPlan();
            if (cleared.ok) {
              setMessage("Saved plan cleared. Your current inputs remain open.");
            } else {
              setError(cleared.error);
            }
          }}
        >
          Clear Saved Plan
        </button>
      </div>
      <div className="calculator-grid">
        <div className="input-panel">
          {state.plannerMode === "quick" ? (
            <QuickPlanner
              state={state}
              catalog={catalog}
              onChange={updateState}
              onLoadExample={loadExample}
            />
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
