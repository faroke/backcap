export class DuplicateSKU extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateSKU";
  }

  static create(sku: string): DuplicateSKU {
    return new DuplicateSKU(`Duplicate SKU: "${sku}"`);
  }
}
