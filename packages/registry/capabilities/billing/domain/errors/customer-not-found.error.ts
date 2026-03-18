export class CustomerNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerNotFound";
  }

  static create(id: string): CustomerNotFound {
    return new CustomerNotFound(`Customer not found: "${id}"`);
  }
}
