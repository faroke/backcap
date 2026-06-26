export class InvalidInvoice extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInvoice";
  }

  static invalidStatus(status: string): InvalidInvoice {
    return new InvalidInvoice(`Invalid invoice status: "${status}"`);
  }

  static cannotMarkPaid(status: string): InvalidInvoice {
    return new InvalidInvoice(`Cannot mark invoice as paid from status "${status}"`);
  }
}
