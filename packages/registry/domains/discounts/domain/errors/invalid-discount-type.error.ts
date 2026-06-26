export class InvalidDiscountType extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDiscountType";
  }

  static create(value: string, validTypes: readonly string[]): InvalidDiscountType {
    return new InvalidDiscountType(`Invalid discount type: "${value}". Valid: ${validTypes.join(", ")}`);
  }
}
