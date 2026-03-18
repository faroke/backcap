export class InvoiceNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceNotFound";
  }

  static create(id: string): InvoiceNotFound {
    return new InvoiceNotFound(`Invoice not found: "${id}"`);
  }
}
