export interface CreateProductInput {
  name: string;
  description: string;
  basePriceCents: number;
  currency?: string;
  categoryId?: string;
}
