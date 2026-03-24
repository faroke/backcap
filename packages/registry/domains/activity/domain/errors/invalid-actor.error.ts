export class InvalidActor extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidActor";
  }

  static create(reason: string): InvalidActor {
    return new InvalidActor(`Invalid actor: ${reason}`);
  }
}
