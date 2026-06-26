export class InvalidSKU extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSKU";
  }

  static required(): InvalidSKU {
    return new InvalidSKU("SKU value is required and must be a string");
  }

  static invalidFormat(value: string): InvalidSKU {
    return new InvalidSKU(
      `Invalid SKU format: "${value}". Must be 3-50 alphanumeric characters with optional hyphens.`,
    );
  }
}
