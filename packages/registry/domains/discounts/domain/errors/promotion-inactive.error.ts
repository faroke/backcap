export class PromotionInactive extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromotionInactive";
  }

  static create(id: string): PromotionInactive {
    return new PromotionInactive(`Promotion is not active: ${id}`);
  }
}
