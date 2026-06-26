export class InvalidProductDescription extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProductDescription";
  }

  static required(): InvalidProductDescription {
    return new InvalidProductDescription("Product description is required");
  }
}
