export interface CreatePromotionInput {
  id: string;
  name: string;
  description?: string;
  rules: Array<{
    id: string;
    type: string;
    percentageValue?: number;
    fixedAmountValue?: number;
    fixedAmountCurrency?: string;
    buyQuantity?: number;
    getQuantity?: number;
    maxDiscountAmountValue?: number;
    maxDiscountAmountCurrency?: string;
  }>;
  conditions?: Array<{
    id: string;
    type: string;
    minOrderAmountCents?: number;
    minOrderAmountCurrency?: string;
    productIds?: string[];
    customerSegment?: string;
    minItemQuantity?: number;
  }>;
  startDate: Date;
  endDate: Date;
  stackable?: boolean;
  priority?: number;
}
