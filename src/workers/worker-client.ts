import type { SearchProgress, SolveRequest, SolveResult } from "@/domain/enchanting/types";
import type {
  CatalogSnapshot,
  SolverWorkerEvent,
  SolverWorkerRequest,
} from "./protocol";

type PendingSolve = {
  requestId: string;
  resolve: (result: SolveResult) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: SearchProgress) => void;
};

export class EnchantmentSolverClient {
  private worker: Worker;
  private requestSequence = 0;
  private pending: PendingSolve | null = null;
  private catalog: CatalogSnapshot | null = null;
  private catalogWaiters: Array<(catalog: CatalogSnapshot) => void> = [];

  constructor() {
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new Worker(
      new URL("./enchantment-solver.worker.ts", import.meta.url),
      { type: "module", name: "anvilpilot-enchantment-solver" },
    );
    worker.addEventListener("message", this.handleMessage);
    worker.addEventListener("error", this.handleWorkerError);
    worker.postMessage({ type: "init" } satisfies SolverWorkerRequest);
    return worker;
  }

  private handleMessage = (event: MessageEvent<SolverWorkerEvent>): void => {
    const message = event.data;
    if (message.type === "ready") {
      this.catalog = message.catalog;
      this.catalogWaiters.splice(0).forEach((resolve) => resolve(message.catalog));
      return;
    }
    if (!this.pending || message.requestId !== this.pending.requestId) return;
    if (message.type === "progress") {
      this.pending.onProgress?.({
        phase: message.phase,
        exploredStates: message.exploredStates,
        progress: message.progress,
      });
      return;
    }
    const pending = this.pending;
    this.pending = null;
    if (message.type === "success") pending.resolve(message.result);
    if (message.type === "cancelled") {
      pending.reject(new DOMException("Calculation cancelled", "AbortError"));
    }
    if (message.type === "error") pending.reject(new Error(message.message));
  };

  private handleWorkerError = (): void => {
    this.pending?.reject(
      new Error("The calculation worker stopped. Your inputs are safe; try calculating again."),
    );
    this.pending = null;
    this.worker.terminate();
    this.worker = this.createWorker();
  };

  getCatalog(): Promise<CatalogSnapshot> {
    if (this.catalog) return Promise.resolve(this.catalog);
    return new Promise((resolve) => this.catalogWaiters.push(resolve));
  }

  solve(
    request: SolveRequest,
    onProgress?: (progress: SearchProgress) => void,
  ): Promise<SolveResult> {
    this.cancelActive();
    const requestId = `solve-${++this.requestSequence}`;
    return new Promise((resolve, reject) => {
      this.pending = { requestId, resolve, reject, onProgress };
      this.worker.postMessage({
        type: "solve",
        requestId,
        request,
      } satisfies SolverWorkerRequest);
    });
  }

  cancelActive(): void {
    if (!this.pending) return;
    const pending = this.pending;
    this.pending = null;
    this.worker.postMessage({
      type: "cancel",
      requestId: pending.requestId,
    } satisfies SolverWorkerRequest);
    pending.reject(new DOMException("Calculation cancelled", "AbortError"));
  }

  terminate(): void {
    this.cancelActive();
    this.worker.terminate();
  }
}
