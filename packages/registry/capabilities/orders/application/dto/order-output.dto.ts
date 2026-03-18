export interface OrderItemOutput {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotal: number;
}

export interface AddressOutput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface OrderOutput {
  id: string;
  status: string;
  items: OrderItemOutput[];
  shippingAddress: AddressOutput;
  billingAddress: AddressOutput;
  totalCents: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
