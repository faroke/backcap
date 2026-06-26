export class InvalidOrderStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderStatus";
  }

  static create(value: string): InvalidOrderStatus {
    return new InvalidOrderStatus(`Invalid order status: "${value}"`);
  }
}
