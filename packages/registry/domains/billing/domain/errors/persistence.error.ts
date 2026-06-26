export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceError";
  }

  static create(message: string): PersistenceError {
    return new PersistenceError(message);
  }
}
