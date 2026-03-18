import { Result } from "../../shared/result.js";
import type { Invoice } from "../../domain/entities/invoice.entity.js";
import { InvoiceNotFound } from "../../domain/errors/invoice-not-found.error.js";
import type { IInvoiceRepository } from "../ports/invoice-repository.port.js";

export class GetInvoice {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(invoiceId: string): Promise<Result<Invoice, Error>> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      return Result.fail(InvoiceNotFound.create(invoiceId));
    }
    return Result.ok(invoice);
  }
}
