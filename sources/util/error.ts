export function makeErrorSerializable(error: unknown): unknown {
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
