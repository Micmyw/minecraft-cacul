/// <reference lib="webworker" />

import { SearchCancelledError } from "@/domain/enchanting/search-common";
import { solve } from "@/domain/enchanting/solver";
import {
  createCatalogSnapshot,
  type SolverWorkerEvent,
  type SolverWorkerRequest,
} from "./protocol";

const worker = self as DedicatedWorkerGlobalScope;
const cancelled = new Set<string>();
let activeRequestId: string | null = null;

function send(event: SolverWorkerEvent): void {
  worker.postMessage(event);
}

function sendReady(): void {
  send({ type: "ready", catalog: createCatalogSnapshot() });
}

worker.addEventListener("message", async (event: MessageEvent<SolverWorkerRequest>) => {
  const message = event.data;
  if (message.type === "init") {
    sendReady();
    return;
  }
  if (message.type === "cancel") {
    cancelled.add(message.requestId);
    return;
  }

  if (activeRequestId && activeRequestId !== message.requestId) {
    cancelled.add(activeRequestId);
  }
  activeRequestId = message.requestId;
  cancelled.delete(message.requestId);
  try {
    const result = await solve(message.request, {
      isCancelled: () => cancelled.has(message.requestId),
      onProgress: (progress) =>
        send({
          type: "progress",
          requestId: message.requestId,
          ...progress,
        }),
      yieldControl: () => new Promise((resolve) => setTimeout(resolve, 0)),
    });
    if (cancelled.has(message.requestId)) {
      send({ type: "cancelled", requestId: message.requestId });
    } else {
      send({ type: "success", requestId: message.requestId, result });
    }
  } catch (error) {
    if (error instanceof SearchCancelledError) {
      send({ type: "cancelled", requestId: message.requestId });
    } else {
      send({
        type: "error",
        requestId: message.requestId,
        message:
          error instanceof Error
            ? error.message
            : "The solver stopped unexpectedly. You can still edit this plan and try again.",
      });
    }
  } finally {
    cancelled.delete(message.requestId);
    if (activeRequestId === message.requestId) activeRequestId = null;
  }
});
