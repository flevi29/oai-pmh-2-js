import type { Result } from "$lib/generic-result";
import type { OaiPmh } from "oai-pmh-2-js/oai-pmh";

export const resultStatus = Object.freeze({
  pending: 0,
  success: 1,
  failure: 2,
});

type ResultStatusType = typeof resultStatus;
export type ResultStatus = ResultStatusType[keyof ResultStatusType];

export type OaiPmhResult<T> =
  | { status: ResultStatusType["pending"] }
  | { status: ResultStatusType["success"]; value: T }
  | { status: ResultStatusType["failure"]; value: unknown };

export function getCachedResultValue<T>() {
  let cachedValue: T[] | undefined = undefined;

  return {
    get() {
      return cachedValue;
    },

    set(newValue: T[]) {
      cachedValue = newValue;
    },

    unset() {
      cachedValue = undefined;
    },
  };
}

export type CachedResultValue<T> = ReturnType<typeof getCachedResultValue<T>>;

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
  getOaiPmh: () => Result<OaiPmh>,
  getGenerator: (
    oaiPmh: OaiPmh,
    signal: AbortSignal,
  ) => AsyncGenerator<T[], void>,
  cache: CachedResultValue<T>,
) {
  const ac = getAbortController();

  // TODO: Make these things global, and if isRunning is true disallow setting a new oaiPmh
  let isRunning = $state.raw(false);
  let isBeingStopped = $state.raw(false);

  const cachedValue = cache.get();
  let result = $state.raw<OaiPmhResult<T[]>>(
    cachedValue !== undefined
      ? {
          status: resultStatus.success,
          value: cachedValue,
        }
      : { status: resultStatus.pending },
  );

  const canBeStopped = $derived(isRunning && !isBeingStopped);

  function stop() {
    if (isBeingStopped) {
      throw new Error("stopping procedure already in progress");
    }

    isBeingStopped = true;
    ac.abort();
  }

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
        const { success, value } = getOaiPmh();
        if (!success) {
          throw value;
        }

        const arr: T[] = [];
        result = { status: resultStatus.pending };

        for await (const items of getGenerator(value, ac.signal)) {
          arr.push(...items);
          result = { status: resultStatus.success, value: arr };
          cache.set(arr);
        }
      })()
        .catch((error) => {
          if (
            error !== null &&
            typeof error === "object" &&
            Object.hasOwn(error, "cause") &&
            error.cause === ABORT_SYMBOL
          ) {
            return;
          }

          result = { status: resultStatus.failure, value: error };
          cache.unset();
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
