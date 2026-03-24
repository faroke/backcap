export interface ApplyDiscountInput {
  orderTotalCents: number;
  orderCurrency: string;
  productIds: string[];
  customerId: string;
  totalItemQuantity: number;
  customerSegment?: string;
  couponCode?: string;
}
