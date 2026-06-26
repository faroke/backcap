export class UnexpectedCartState extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnexpectedCartState";
  }

  static create(reason: string): UnexpectedCartState {
    return new UnexpectedCartState(reason);
  }
}
