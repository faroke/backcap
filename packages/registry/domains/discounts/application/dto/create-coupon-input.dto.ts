export interface CreateCouponInput {
  id: string;
  code: string;
  promotionId: string;
  maxUsesTotal?: number | null;
  maxUsesPerCustomer?: number | null;
  startDate: Date;
  endDate: Date;
}
