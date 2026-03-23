export class CartLimitExceeded extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartLimitExceeded";
  }

  static create(maxItems: number): CartLimitExceeded {
    return new CartLimitExceeded(`Cart cannot exceed ${maxItems} items`);
  }
}
