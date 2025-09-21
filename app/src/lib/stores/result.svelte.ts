import type { OaiPmh } from "oai-pmh-2-js/oai-pmh";
import { untrack } from "svelte";
import { globalOaiPmh } from "./oai-pmh.svelte";

export type Result<T> =
  | { success: true; value: T }
  | { success: false; value: unknown };

const ABORT_SYMBOL = Symbol("<stopped>");

function getAbortController() {
  let ac = new AbortController();
  let signal = ac.signal;

  return {
    get signal() {
      return signal;
    },
    abort(): void {
      ac.abort(ABORT_SYMBOL);
      ac = new AbortController();
      signal = ac.signal;
    },
  };
}

export function getResultStore<T>(
  getGenerator: (
    oaiPmh: OaiPmh,
    signal: AbortSignal,
  ) => AsyncGenerator<T[], void>,
  initialValue: T[] = [],
) {
  const ac = getAbortController();

  // TODO: Make these things global, and if isRunning is true disallow setting a new oaiPmh
  let isRunning = $state(false);
  let isBeingStopped = $state(false);
  let result = $state<Result<T[]>>({ success: true, value: initialValue });

  const canBeStopped = $derived(isRunning && !isBeingStopped);

  function stop() {
    if (isBeingStopped) {
      throw new Error("stopping procedure already in progress");
    }

    isBeingStopped = true;
    ac.abort();
  }

  // in case oaiPmh changes, stop and reset values
  let isFirstRun = true;
  $effect(() => {
    globalOaiPmh;

    // skip first run so we don't react to init
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    untrack(() => {
      if (canBeStopped) {
        stop();
      }

      result = { success: true, value: [] };
    });
  });

  // stop when unmounted
  $effect(() => () => {
    if (canBeStopped) {
      stop();
    }
  });

  return {
    run() {
      if (isRunning) {
        throw new Error("already running");
      }

      isRunning = true;

      (async () => {
        if (globalOaiPmh.value === undefined) {
          // TODO
          throw new Error("oaiPmh undefined");
        }

        result = { success: true, value: [] };

        for await (const items of getGenerator(globalOaiPmh.value, ac.signal)) {
          result.value.push(...items);
        }
      })()
        .catch((error) => {
          if (Object.hasOwn(error, "cause") && error.cause === ABORT_SYMBOL) {
            return;
          }

          result = { success: false, value: error };
        })
        .finally(() => {
          isRunning = false;
          isBeingStopped = false;
        });
    },
    stop,
    get result() {
      return result;
    },
    get canBeStopped() {
      return canBeStopped;
    },
    get isRunning() {
      return isRunning;
    },
  };
}
