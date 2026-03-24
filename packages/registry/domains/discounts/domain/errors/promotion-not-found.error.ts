export class PromotionNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromotionNotFound";
  }

  static create(id: string): PromotionNotFound {
    return new PromotionNotFound(`Promotion not found: ${id}`);
  }
}
