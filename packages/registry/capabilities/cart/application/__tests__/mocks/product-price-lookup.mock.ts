import type { IProductPriceLookup, ProductPriceInfo } from "../../ports/product-price-lookup.port.js";

export class InMemoryProductPriceLookup implements IProductPriceLookup {
  private store = new Map<string, ProductPriceInfo>();

  addPrice(info: ProductPriceInfo): void {
    this.store.set(`${info.productId}:${info.variantId}`, info);
  }

  async getPrice(productId: string, variantId: string): Promise<ProductPriceInfo | null> {
    return this.store.get(`${productId}:${variantId}`) ?? null;
  }
}
