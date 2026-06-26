export class ProductNotArchivable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotArchivable";
  }

  static create(): ProductNotArchivable {
    return new ProductNotArchivable("Only active products can be archived");
  }
}
