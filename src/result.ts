export type Optional<T> = T | undefined | null;
export type Result<T, E> = [Optional<T>, Optional<E>];

/**
 * Return a valid value
 *
 * @param value The result value
 * @returns
 */
export function Ok<T>(value: T): Result<T, null> {
  return [value, null];
}

/**
 * Return an error if there is no value
 *
 * @param error
 * @returns
 */
export function Err<E>(error: E): Result<null, E> {
  return [null, error];
}

/**
 * Wrap a normal function into a new function that returns a Result object with the return value, or an error.
 * Note: If you want to create a wrapped function for an asynchronous function, see {@link wrapAsync}.
 *
 * @param input The input function
 * @returns {Result<ReturnType<T>, Error>}
 */
export function wrap<T extends (...args: any[]) => any>(
  input: T,
): (...args: Parameters<T>) => Result<ReturnType<T>, Error> {
  return (...args: Parameters<T>) => {
    try {
      return Ok(input(...args));
    } catch (error) {
      return Err(error as Error);
    }
  };
}

/**
 * Wrap a normal function into a new function that returns a Result object with the return value, or an error.
 * Note: If you want to create a wrapped result for an already created promise, see {@link wrapPromise}.
 *
 * @param input The input function (asynchronous function)
 */
export function wrapAsync<
  T extends (...args: any[]) => Promise<RT>,
  RT = ReturnType<T> extends Promise<infer U> ? U : never,
>(input: T): (...args: Parameters<T>) => Promise<Result<RT, Error>> {
  return async (...args: Parameters<T>) => {
    try {
      return Ok(await input(...args));
    } catch (error) {
      return Err(error as Error);
    }
  };
}

/**
 * Wrap an existing promise as an {@link Result}, to handle the error properly.
 *
 * @param promise The promise to handle
 * @returns {Promise<Result<T, TE>>} This promise NEVER throws.
 */
export async function wrapPromise<T, TE extends Error>(
  promise: Promise<T>,
): Promise<Result<T, TE>> {
  try {
    const result = await promise;

    return Ok(result);
  } catch (error: unknown) {
    return Err(error as TE);
  }
}
