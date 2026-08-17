import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CatalogSnapshot,
  SolverWorkerEvent,
  SolverWorkerRequest,
} from "@/domain/enchanting/types";
import { EnchantmentSolverClient } from "@/workers/worker-client";
import { request } from "../fixtures/ingredients";

class FakeWorker {
  static instances: FakeWorker[] = [];

  readonly messages: SolverWorkerRequest[] = [];
  readonly listeners = new Map<string, Set<EventListener>>();
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  postMessage(message: SolverWorkerRequest): void {
    this.messages.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  emitMessage(message: SolverWorkerEvent): void {
    const event = new MessageEvent("message", { data: message });
    this.listeners.get("message")?.forEach((listener) => listener(event));
  }

  emitError(): void {
    const event = new Event("error");
    this.listeners.get("error")?.forEach((listener) => listener(event));
  }
}

const catalog: CatalogSnapshot = {
  edition: "java",
  gameVersion: "26.2",
  items: [{ id: "sword", name: "Sword" }],
  enchantments: [{
    id: "mending",
    name: "Mending",
    maxLevel: 1,
    supportedItemIds: ["sword"],
    incompatibleWith: [],
  }],
};

describe("EnchantmentSolverClient", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal("Worker", FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes the catalog and relays progress for the active request", async () => {
    const client = new EnchantmentSolverClient();
    const worker = FakeWorker.instances[0];
    expect(worker.messages).toEqual([{ type: "init" }]);

    const catalogPromise = client.getCatalog();
    worker.emitMessage({ type: "ready", catalog });
    await expect(catalogPromise).resolves.toEqual(catalog);

    const onProgress = vi.fn();
    const resultPromise = client.solve(request(), onProgress);
    const solveMessage = worker.messages.at(-1);
    expect(solveMessage?.type).toBe("solve");
    if (solveMessage?.type !== "solve") return;
    worker.emitMessage({
      type: "progress",
      requestId: solveMessage.requestId,
      phase: "exact-search",
      exploredStates: 512,
      progress: 0.5,
    });
    worker.emitMessage({
      type: "success",
      requestId: solveMessage.requestId,
      result: { status: "invalid-input", errors: ["fixture"] },
    });

    await expect(resultPromise).resolves.toEqual({ status: "invalid-input", errors: ["fixture"] });
    expect(onProgress).toHaveBeenCalledWith({
      phase: "exact-search",
      exploredStates: 512,
      progress: 0.5,
    });
    client.terminate();
    expect(worker.terminated).toBe(true);
  });

  it("cancels the old request and ignores its stale result", async () => {
    const client = new EnchantmentSolverClient();
    const worker = FakeWorker.instances[0];
    const first = client.solve(request());
    const firstMessage = worker.messages.at(-1);
    const second = client.solve(request());
    const secondMessage = worker.messages.at(-1);
    await expect(first).rejects.toMatchObject({ name: "AbortError" });
    expect(worker.messages).toContainEqual({
      type: "cancel",
      requestId: firstMessage && "requestId" in firstMessage ? firstMessage.requestId : "missing",
    });
    if (
      firstMessage?.type !== "solve" ||
      secondMessage?.type !== "solve"
    ) return;

    worker.emitMessage({
      type: "success",
      requestId: firstMessage.requestId,
      result: { status: "invalid-input", errors: ["stale"] },
    });
    worker.emitMessage({
      type: "success",
      requestId: secondMessage.requestId,
      result: { status: "invalid-input", errors: ["current"] },
    });
    await expect(second).resolves.toEqual({ status: "invalid-input", errors: ["current"] });
    client.terminate();
  });

  it("rejects a crashed request and rebuilds a usable Worker", async () => {
    const client = new EnchantmentSolverClient();
    const firstWorker = FakeWorker.instances[0];
    const failed = client.solve(request());
    firstWorker.emitError();
    await expect(failed).rejects.toThrow("calculation worker stopped");
    expect(firstWorker.terminated).toBe(true);
    expect(FakeWorker.instances).toHaveLength(2);

    const recoveredWorker = FakeWorker.instances[1];
    expect(recoveredWorker.messages).toEqual([{ type: "init" }]);
    const recovered = client.solve(request());
    const solveMessage = recoveredWorker.messages.at(-1);
    if (solveMessage?.type !== "solve") return;
    recoveredWorker.emitMessage({
      type: "success",
      requestId: solveMessage.requestId,
      result: { status: "invalid-input", errors: ["recovered"] },
    });
    await expect(recovered).resolves.toEqual({ status: "invalid-input", errors: ["recovered"] });
    client.terminate();
  });
});
