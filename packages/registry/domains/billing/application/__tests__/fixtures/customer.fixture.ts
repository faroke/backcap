import { Customer } from "../../../domain/entities/customer.entity.js";

export function createTestCustomer(
  overrides?: Partial<{
    id: string;
    email: string;
    name: string;
    externalId: string;
  }>,
): Customer {
  const result = Customer.create({
    id: overrides?.id ?? "cust-test-1",
    email: overrides?.email ?? "customer@example.com",
    name: overrides?.name ?? "Test Customer",
    externalId: overrides?.externalId,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test customer: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
