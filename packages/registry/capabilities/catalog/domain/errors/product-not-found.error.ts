export class ProductNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFound";
  }

  static create(productId: string): ProductNotFound {
    return new ProductNotFound(`Product not found: "${productId}"`);
  }
}
