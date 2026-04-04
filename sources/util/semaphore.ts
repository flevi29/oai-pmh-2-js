export function getSemaphore(weight: number) {
  const WEIGHT = weight;
  let promiseChain = Promise.resolve(() => {});
  let p = Promise.withResolvers<void>();
  let ep = Promise.withResolvers<void>();
  let done = false;

  return {
    acquireLock(): Promise<() => void> {
      return (promiseChain = promiseChain.then(async () => {
        if (done) {
          throw new Error("cannot acquire lock after finish");
        }

        if (weight === 0) {
          await p.promise;
        }

        weight -= 1;

        let callback: (() => void) | null = () => {
          if (weight === 0) {
            p.resolve();
            p = Promise.withResolvers();
          }

          weight += 1;

          if (weight === WEIGHT) {
            ep.resolve();
            ep = Promise.withResolvers();
          }
        };

        return () => {
          if (callback !== null) {
            callback();
            callback = null;
          }
        };
      }));
    },

    async finish() {
      await (promiseChain = promiseChain.then(async () => {
        done = true;

        await ep.promise;

        return () => {};
      }));
    },
  };
}
