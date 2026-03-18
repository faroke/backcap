import { Invoice, type InvoiceStatus } from "../../../domain/entities/invoice.entity.js";

export function createTestInvoice(
  overrides?: Partial<{
    id: string;
    customerId: string;
    subscriptionId: string;
    amountValue: number;
    amountCurrency: string;
    status: InvoiceStatus;
    dueDate: Date;
  }>,
): Invoice {
  const result = Invoice.create({
    id: overrides?.id ?? "inv-test-1",
    customerId: overrides?.customerId ?? "cust-test-1",
    subscriptionId: overrides?.subscriptionId ?? "sub-test-1",
    amountValue: overrides?.amountValue ?? 2999,
    amountCurrency: overrides?.amountCurrency ?? "USD",
    status: overrides?.status ?? "open",
    dueDate: overrides?.dueDate ?? new Date("2026-04-01"),
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test invoice: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
