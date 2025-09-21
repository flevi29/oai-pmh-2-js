export type Ok<T> = { ok: true; value: T; map: typeof map };
export type Err<E = unknown> = { ok: false; value: E; map: typeof map };
export type Result<T, E = unknown> = Ok<T> | Err<E>;

function map<R extends Result<any, any>, MR extends Result<any, any>>(
  this: R,
  mapFn: (value: R extends Ok<infer T> ? T : never) => MR,
): Result<
  MR extends Ok<infer T> ? T : never,
  MR extends Err<infer E> ? E : never | R extends Err<infer E> ? E : never
> {
  if (!this.ok) {
    return this;
  }

  return mapFn(this.value);
}

export function err<E>(value: E): Err<E> {
  const result = { ok: false, value } as Err<E>;
  result.map = map.bind(result);
  return result;
}

export function ok<T>(value: T): Ok<T> {
  const result = { ok: true, value } as Ok<T>;
  result.map = map.bind(result);
  return result;
}

// This is interesting and cool that we pulled it off, might even save it as a gist, but throwing errors is probably better
