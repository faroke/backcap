export class InvalidPlan extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlan";
  }

  static create(planId: string): InvalidPlan {
    return new InvalidPlan(`Invalid plan: "${planId}"`);
  }
}
