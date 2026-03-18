import { describe, it, expect, beforeEach } from "vitest";
import { GetPaymentHistory } from "../use-cases/get-payment-history.use-case.js";
import { InMemoryCustomerRepository } from "./mocks/customer-repository.mock.js";
import { InMemoryInvoiceRepository } from "./mocks/invoice-repository.mock.js";
import { createTestCustomer } from "./fixtures/customer.fixture.js";
import { createTestInvoice } from "./fixtures/invoice.fixture.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";

describe("GetPaymentHistory use case", () => {
  let customerRepo: InMemoryCustomerRepository;
  let invoiceRepo: InMemoryInvoiceRepository;
  let useCase: GetPaymentHistory;

  beforeEach(() => {
    customerRepo = new InMemoryCustomerRepository();
    invoiceRepo = new InMemoryInvoiceRepository();
    useCase = new GetPaymentHistory(customerRepo, invoiceRepo);
  });

  it("returns payment history for customer", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);
    const invoice = createTestInvoice({ customerId: customer.id });
    await invoiceRepo.save(invoice);

    const result = await useCase.execute(customer.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(1);
  });

  it("returns empty array if no invoices", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);

    const result = await useCase.execute(customer.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });

  it("fails if customer not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CustomerNotFound);
  });
});
