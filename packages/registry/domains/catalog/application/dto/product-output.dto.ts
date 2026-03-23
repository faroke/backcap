export interface ProductVariantOutput {
  id: string;
  sku: string;
  priceCents: number;
  currency: string;
  attributes: Record<string, string>;
}

export interface ProductOutput {
  id: string;
  name: string;
  description: string;
  status: string;
  basePriceCents: number;
  currency: string;
  categoryId: string | null;
  variants: ProductVariantOutput[];
  createdAt: Date;
  updatedAt: Date;
}
