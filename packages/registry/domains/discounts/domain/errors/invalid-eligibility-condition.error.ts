export class InvalidEligibilityCondition extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEligibilityCondition";
  }

  static create(reason: string): InvalidEligibilityCondition {
    return new InvalidEligibilityCondition(reason);
  }
}
