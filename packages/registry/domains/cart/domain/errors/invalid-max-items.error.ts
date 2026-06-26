export class InvalidMaxItems extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMaxItems";
  }

  static create(): InvalidMaxItems {
    return new InvalidMaxItems("maxItems must be a positive integer");
  }
}
