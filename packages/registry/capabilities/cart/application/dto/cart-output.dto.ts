export interface CartItemOutput {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  lineTotal: number;
}

export interface CartOutput {
  id: string;
  userId: string | null;
  status: string;
  items: CartItemOutput[];
  totalCents: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
