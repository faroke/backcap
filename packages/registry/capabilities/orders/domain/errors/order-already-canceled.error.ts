export class OrderAlreadyCanceled extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAlreadyCanceled";
  }

  static create(orderId: string): OrderAlreadyCanceled {
    return new OrderAlreadyCanceled(`Order already canceled: "${orderId}"`);
  }
}
