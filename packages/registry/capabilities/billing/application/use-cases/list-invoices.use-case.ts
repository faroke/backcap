import { Result } from "../../shared/result.js";
import type { Invoice } from "../../domain/entities/invoice.entity.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";
import type { ICustomerRepository } from "../ports/customer-repository.port.js";
import type { IInvoiceRepository } from "../ports/invoice-repository.port.js";

export class ListInvoices {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(customerId: string): Promise<Result<Invoice[], Error>> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      return Result.fail(CustomerNotFound.create(customerId));
    }

    const invoices = await this.invoiceRepository.findByCustomerId(customerId);
    return Result.ok(invoices);
  }
}
