import { describe, it, expect, beforeEach } from "vitest";
import { ListInvoices } from "../use-cases/list-invoices.use-case.js";
import { InMemoryCustomerRepository } from "./mocks/customer-repository.mock.js";
import { InMemoryInvoiceRepository } from "./mocks/invoice-repository.mock.js";
import { createTestCustomer } from "./fixtures/customer.fixture.js";
import { createTestInvoice } from "./fixtures/invoice.fixture.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";

describe("ListInvoices use case", () => {
  let customerRepo: InMemoryCustomerRepository;
  let invoiceRepo: InMemoryInvoiceRepository;
  let useCase: ListInvoices;

  beforeEach(() => {
    customerRepo = new InMemoryCustomerRepository();
    invoiceRepo = new InMemoryInvoiceRepository();
    useCase = new ListInvoices(customerRepo, invoiceRepo);
  });

  it("lists invoices for customer", async () => {
    const customer = createTestCustomer();
    await customerRepo.save(customer);
    await invoiceRepo.save(createTestInvoice({ id: "inv-1", customerId: customer.id }));
    await invoiceRepo.save(createTestInvoice({ id: "inv-2", customerId: customer.id }));

    const result = await useCase.execute(customer.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });

  it("fails if customer not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CustomerNotFound);
  });
});
