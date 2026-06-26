export class ProductNotPublishable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductNotPublishable";
  }

  static create(): ProductNotPublishable {
    return new ProductNotPublishable("Only draft products can be published");
  }
}
