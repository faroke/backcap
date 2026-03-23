import { describe, it, expect, beforeEach } from "vitest";
import { GenerateInvoice } from "../use-cases/generate-invoice.use-case.js";
import { InMemoryCustomerRepository } from "./mocks/customer-repository.mock.js";
import { InMemoryInvoiceRepository } from "./mocks/invoice-repository.mock.js";
import { createTestCustomer } from "./fixtures/customer.fixture.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";

describe("GenerateInvoice use case", () => {
  let customerRepo: InMemoryCustomerRepository;
  let invoiceRepo: InMemoryInvoiceRepository;
  let useCase: GenerateInvoice;

  beforeEach(() => {
    customerRepo = new InMemoryCustomerRepository();
    invoiceRepo = new InMemoryInvoiceRepository();
    useCase = new GenerateInvoice(customerRepo, invoiceRepo);
  });

  it("generates invoice successfully", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);

    const result = await useCase.execute({
      customerId: customer.id,
      subscriptionId: "sub-1",
      amountValue: 2999,
      amountCurrency: "USD",
      dueDate: new Date("2026-04-01"),
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.invoiceId).toBeDefined();
    expect(output.event.customerId).toBe(customer.id);
    expect(output.event.amount).toBe(2999);

    const saved = await invoiceRepo.findById(output.invoiceId);
    expect(saved).not.toBeNull();
  });

  it("fails if customer not found", async () => {
    const result = await useCase.execute({
      customerId: "nonexistent",
      amountValue: 2999,
      amountCurrency: "USD",
      dueDate: new Date("2026-04-01"),
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CustomerNotFound);
  });
});
