export class ProductNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotFound";
  }

  static create(productId: string, variantId: string): ProductNotFound {
    return new ProductNotFound(`Product/variant not found: ${productId}/${variantId}`);
  }
}
