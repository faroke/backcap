export class InvalidFlagKey extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFlagKey";
  }

  static create(reason: string): InvalidFlagKey {
    return new InvalidFlagKey(reason);
  }
}
