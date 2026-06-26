export class InvalidProductStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProductStatus";
  }

  static create(value: string): InvalidProductStatus {
    return new InvalidProductStatus(`Invalid product status: "${value}"`);
  }
}
