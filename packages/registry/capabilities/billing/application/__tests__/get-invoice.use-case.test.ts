import { describe, it, expect, beforeEach } from "vitest";
import { GetInvoice } from "../use-cases/get-invoice.use-case.js";
import { InMemoryInvoiceRepository } from "./mocks/invoice-repository.mock.js";
import { createTestInvoice } from "./fixtures/invoice.fixture.js";

describe("GetInvoice use case", () => {
  let invoiceRepo: InMemoryInvoiceRepository;
  let useCase: GetInvoice;

  beforeEach(() => {
    invoiceRepo = new InMemoryInvoiceRepository();
    useCase = new GetInvoice(invoiceRepo);
  });

  it("returns invoice by id", async () => {
    const invoice = createTestInvoice();
    await invoiceRepo.save(invoice);

    const result = await useCase.execute(invoice.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe(invoice.id);
  });

  it("fails if not found", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
  });
});
