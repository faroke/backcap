export interface ProductPriceInfo {
  productId: string;
  variantId: string;
  priceCents: number;
  currency: string;
}

export interface IProductPriceLookup {
  getPrice(productId: string, variantId: string): Promise<ProductPriceInfo | null>;
}
