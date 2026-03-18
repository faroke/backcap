export interface ProcessPaymentInput {
  customerId: string;
  amount: number;
  currency: string;
  description?: string;
}
