export class InvalidPromotion extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPromotion";
  }

  static create(reason: string): InvalidPromotion {
    return new InvalidPromotion(reason);
  }
}
