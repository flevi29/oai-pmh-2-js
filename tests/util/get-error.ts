import { expect } from "vitest";

function makeErrorSerializable(error: unknown): unknown {
  return error instanceof Error
    ? {
        msg: `[${error.name}]: ${error.message}`,
        cause: makeErrorSerializable(error.cause),
        ...Object.fromEntries(
          Object.entries(error).filter(
            ([key]) => key !== "name" && key !== "message",
          ),
        ),
      }
    : error;
}

export async function getError(cb: (...args: any[]) => any) {
  try {
    await cb();
    expect.fail("expected function to throw, but it did not");
  } catch (error) {
    if (error instanceof Error && error.name === "AssertionError") {
      throw error;
    }

    return makeErrorSerializable(error);
  }
}

// Note: won't work with keys containing "." for lack of escaping
export function retract(o: unknown, paths: string[]) {
  outer: for (const keys of paths.map((v) => v.split(/\./g))) {
    let so = o;
    for (const [i, key] of keys.entries()) {
      if (so === null || typeof so !== "object" || !(key in so)) {
        continue outer;
      }

      if (i === keys.length - 1) {
        (so[key as keyof typeof so] as any) = "<retracted>";
      } else {
        so = so[key as keyof typeof so];
      }
    }
  }
}
