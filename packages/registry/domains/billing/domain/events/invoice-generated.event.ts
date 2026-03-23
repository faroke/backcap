export class InvoiceGenerated {
  public readonly invoiceId: string;
  public readonly customerId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly occurredAt: Date;

  constructor(invoiceId: string, customerId: string, amount: number, currency: string, occurredAt: Date = new Date()) {
    this.invoiceId = invoiceId;
    this.customerId = customerId;
    this.amount = amount;
    this.currency = currency;
    this.occurredAt = occurredAt;
  }
}
