export interface PlaceOrderItemInput {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface PlaceOrderInput {
  items: PlaceOrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
}
