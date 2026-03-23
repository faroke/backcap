export class OrderNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderNotFound";
  }

  static create(orderId: string): OrderNotFound {
    return new OrderNotFound(`Order not found: "${orderId}"`);
  }
}
