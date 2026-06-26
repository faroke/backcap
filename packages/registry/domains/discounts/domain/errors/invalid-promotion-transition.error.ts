export class InvalidPromotionTransition extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPromotionTransition";
  }

  static create(action: string, status: string): InvalidPromotionTransition {
    return new InvalidPromotionTransition(`Cannot ${action} promotion in "${status}" status`);
  }
}
