export interface AddVariantInput {
  productId: string;
  sku: string;
  priceCents: number;
  currency?: string;
  attributes?: Record<string, string>;
}
