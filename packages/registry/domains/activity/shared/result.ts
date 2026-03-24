export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly value: T | undefined,
    private readonly error: E | undefined,
    private readonly _isOk: boolean,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, undefined, true);
  }

  static fail<E extends Error>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error, false);
  }

  isOk(): boolean {
    return this._isOk;
  }

  isFail(): boolean {
    return !this._isOk;
  }

  unwrap(): T {
    if (!this._isOk) {
      throw this.error;
    }
    return this.value as T;
  }

  unwrapError(): E {
    if (this._isOk) {
      throw new Error("Cannot unwrapError on an ok Result");
    }
    return this.error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isOk) {
      return Result.ok(fn(this.value as T));
    }
    return Result.fail(this.error as E);
  }
}
