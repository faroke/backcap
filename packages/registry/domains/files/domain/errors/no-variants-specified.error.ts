export class NoVariantsSpecified extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoVariantsSpecified";
  }

  static create(): NoVariantsSpecified {
    return new NoVariantsSpecified("At least one variant spec must be provided");
  }
}
