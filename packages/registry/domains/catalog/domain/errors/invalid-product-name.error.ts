export class InvalidProductName extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProductName";
  }

  static empty(): InvalidProductName {
    return new InvalidProductName("Product name cannot be empty");
  }

  static tooLong(): InvalidProductName {
    return new InvalidProductName("Product name cannot exceed 500 characters");
  }
}
