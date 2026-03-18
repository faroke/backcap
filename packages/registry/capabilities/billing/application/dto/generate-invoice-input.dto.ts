export interface GenerateInvoiceInput {
  customerId: string;
  subscriptionId?: string;
  amountValue: number;
  amountCurrency: string;
  dueDate: Date;
}
