import { Result } from "../../shared/result.js";
import { Invoice } from "../../domain/entities/invoice.entity.js";
import { InvoiceGenerated } from "../../domain/events/invoice-generated.event.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";
import type { ICustomerRepository } from "../ports/customer-repository.port.js";
import type { IInvoiceRepository } from "../ports/invoice-repository.port.js";
import type { GenerateInvoiceInput } from "../dto/generate-invoice-input.dto.js";

export class GenerateInvoice {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(
    input: GenerateInvoiceInput,
  ): Promise<Result<{ invoiceId: string; event: InvoiceGenerated }, Error>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      return Result.fail(CustomerNotFound.create(input.customerId));
    }

    const id = crypto.randomUUID();
    const invoiceResult = Invoice.create({
      id,
      customerId: input.customerId,
      subscriptionId: input.subscriptionId,
      amountValue: input.amountValue,
      amountCurrency: input.amountCurrency,
      status: "open",
      dueDate: input.dueDate,
    });

    if (invoiceResult.isFail()) {
      return Result.fail(invoiceResult.unwrapError());
    }

    const invoice = invoiceResult.unwrap();
    await this.invoiceRepository.save(invoice);

    const event = new InvoiceGenerated(
      invoice.id,
      input.customerId,
      input.amountValue,
      input.amountCurrency,
    );
    return Result.ok({ invoiceId: invoice.id, event });
  }
}
