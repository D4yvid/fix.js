export type ErrorConstructor = new (...args: any[]) => Error;
export type OnRejected<TE> = (reason: TE) => any | PromiseLike<any>;

const __PROMISE_CATCH_GRABBED = "__PROMISE_CATCH_GRABBED";

function isConstructor(input: Function): boolean {
  return !!input.prototype && !!input.prototype.constructor.name;
}

export class WrappedPromise<T> extends Promise<T> {
  override async catch<TE extends ErrorConstructor>(
    onRejected: OnRejected<TE> | TE,
    callback?: OnRejected<TE>,
  ) {
    if (__PROMISE_CATCH_GRABBED in globalThis) {
      return super.catch(onRejected, callback);
    }

    if (typeof onRejected === "function" && !isConstructor(onRejected)) {
      return super.catch(onRejected as OnRejected<any>);
    }

    const type = onRejected as TE;

    if (!isConstructor(type)) {
      throw new Error(`${type} is not a constructor`);
    }

    return super.catch(async (error: any) => {
      if (error instanceof type) {
        return callback!(error as unknown as TE);
      }

      throw error;
    });
  }
}

/**
 * WARNING!!!!! This function will replace the `.catch` function from the global Promise object.
 *
 * Wrap the global `Promise` object so it's .catch is typed.
 */
export function hookPromiseObject(): void {
  if (__PROMISE_CATCH_GRABBED in globalThis) {
    console.warn("Tried to call `hookPromiseObject` twice");

    return;
  }

  (globalThis as any)[__PROMISE_CATCH_GRABBED] = true;

  const originalCatch = Promise.prototype.catch;

  async function promiseCatchError<T extends ErrorConstructor>(
    this: Promise<any>,
    onRejected: OnRejected<T> | T,
    callback?: OnRejected<T>,
  ) {
    if (typeof onRejected === "function" && !isConstructor(onRejected)) {
      return originalCatch.call(this, onRejected as OnRejected<any>);
    }

    const type = onRejected as T;

    if (!isConstructor(type)) {
      throw new Error(`${type} is not a constructor`);
    }

    return originalCatch.call(this, async (error: any) => {
      if (error instanceof type) {
        return callback!(error as unknown as T);
      }

      throw error;
    });
  }

  Promise.prototype.catch = promiseCatchError;
}

declare global {
  interface Promise<T> {
    catch<TE = any>(
      onRejectedOrErrorConstructor: OnRejected<TE> | ErrorConstructor,
      callback?: OnRejected<TE>,
    ): Promise<T>;
  }
}
