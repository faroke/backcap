export class InvalidQuery extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQuery";
  }

  static create(reason: string): InvalidQuery {
    return new InvalidQuery(`Invalid search query: ${reason}`);
  }
}
