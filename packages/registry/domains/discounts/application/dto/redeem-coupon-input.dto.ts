export interface RedeemCouponInput {
  code: string;
  customerId: string;
  orderTotalCents: number;
  orderCurrency: string;
  productIds: string[];
  totalItemQuantity: number;
  customerSegment?: string;
}
