export class CartNotActive extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartNotActive";
  }

  static create(reason: string): CartNotActive {
    return new CartNotActive(reason);
  }
}
