# fix-errors.js - An error handling library for JavaScript that fixes all of it's issues with error handling

A minimal error-handling library for JavaScript/TypeScript, functional, Result-based approach.

## ✨ Features
 - ✅ Functional error handling with `Result<T, E>`.
 - ✅ First-class **TypeScript** support.
 - ✅ Works with sync and async code.
 - ✅ Wraps promises to avoid **.catch()** hell.
 - ✅ Optional global hook to enhance Promise.prototype.catch() with type filtering. (see `WrappedPromise` & `hookPromiseObject`)

## 📦 Installation
```
$ npm install fix-errors.js            # For npm
$ pnpm install fix-errors.js           # For pnpm
$ yarn add fix-errors.js               # For yarn
$ bun install fix-errors.js            # For bun
```

## 🔧 Usage

### Basic types
```ts
import { Ok, Err, Result } from "fix-errors.js";

const success: Result<number, never> = Ok(42);
const failure: Result<never, string> = Err("Something went wrong.");
```

### Wrapping throwable functions
```ts
import { readFileSync as unsafeReadFileSync } from "fs";
import { wrap } from "fix-errors.js";

const readFileSync = wrap(unsafeReadFileSync);

const [data, error] = readFileSync("file.txt");

if (error) {
  console.error("Failed to read file.txt:", error);
  process.exit(1);
}

console.log("file.txt: %d bytes", data.length);
```

### Wrapping asynchronous functions
```ts
import { wrapAsync, wrapPromise } from "fix-errors.js";

const safeFetch = wrapAsync(globalThis.fetch);

async function getUsers(): Promise<Result<User[], string>> {
  const [response, err] = await safeFetch("/api/v1/users");

  if (err) return Err(`Fetching data failed: ${err}`);

  const [users, parseError] = await wrapPromise(response.json());

  if (parseError)
    return Err(`Failed to parse JSON: ${parseError}`);

  return Ok(users as User[]);
}
```

### Type-checked .catch for Promises
```ts
import { hookPromiseObject, Ok, Err } from "fix-errors.js";

// Call once at program startup!
hookPromiseObject();

const [result, err] = await fetch("/api")
  .then(res => res.json())
  .then(json => Ok(json))
  .catch(AbortError, () => Err("Aborted"))
  .catch(TypeError, () => Err("Bad content"))
  .catch((err) => Err("Unknown error:", err));
```
> ⚠️ Warning: This overrides the native .catch() behavior for all promises. Use responsibly.

### Wrapped promises
```ts
import { readFile as unsafeReadFile } from 'fs';

class CannotReadFileError extends Error {}

async function readFile(path: string) {
  return new WrappedPromise(async (resolve) => {
    unsafeReadFile(path, (data, error) => {
      if (error) throw CannotReadFileError();

      resolve(data);
    });
  });
}

const [result, err] = await readFile("file.txt")
  .then(data => Ok(data))
  /// Typed `.catch` without polluting the global Promise object. (only for WrappedPromise's)
  .catch(CannotReadFileError, () => Err("Couldn't read file.txt"))
  .catch(err => Err(`Unknown error: ${err}`))
```

## 📘 API Reference

### Types
```ts
type Optional<T> = T | undefined | null;
type Result<T, E> = [Optional<T>, Optional<E>];

/**
 * An wrapped version of a promise with a catch() handler with type checking.
 * Use this if you do not want to pollute the global Promise object.
 */
class WrappedPromise<T> extends Promise<T>;
```

### Functions
- `Ok(value)`: Return an valid result.
- `Err(error)`: Return an error result.
- `hookPromiseObject()`: Hook the global Promise object to add a statically-typed
- `wrap(function)`: Wrap a function to return a Result with it's return type as the result's `Ok()` value, and any error thrown as the `Err()` of the result.
- `wrapAsync(asyncFunction)`: Wrap an asynchronous function to return a Promise with the function result as the result's `Ok()` value, and any error thrown as the `Err()` of the result.
- `wrapPromise(promise)`: Wrap an already created promise to return an Result with the promise data.

## 📝 License
MIT

## 🙌 Acknowledgements
Inspired by Rust's `Result`, `Ok` and `Err`.
