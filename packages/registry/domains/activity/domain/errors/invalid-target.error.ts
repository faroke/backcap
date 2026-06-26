export class InvalidTarget extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTarget";
  }

  static create(reason: string): InvalidTarget {
    return new InvalidTarget(`Invalid activity target: ${reason}`);
  }
}
