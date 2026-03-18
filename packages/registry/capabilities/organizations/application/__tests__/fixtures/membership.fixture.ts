import { Membership } from "../../../domain/entities/membership.entity.js";

export function createTestMembership(
  overrides?: Partial<{
    id: string;
    userId: string;
    organizationId: string;
    role: string;
  }>,
): Membership {
  const result = Membership.create({
    id: overrides?.id ?? "test-mem-1",
    userId: overrides?.userId ?? "test-user-1",
    organizationId: overrides?.organizationId ?? "test-org-1",
    role: overrides?.role ?? "member",
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test membership: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
