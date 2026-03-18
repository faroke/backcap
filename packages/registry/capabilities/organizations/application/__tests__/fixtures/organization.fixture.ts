import { Organization } from "../../../domain/entities/organization.entity.js";

export function createTestOrganization(
  overrides?: Partial<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    settings: Record<string, unknown>;
  }>,
): Organization {
  const result = Organization.create({
    id: overrides?.id ?? "test-org-1",
    name: overrides?.name ?? "Test Organization",
    slug: overrides?.slug ?? "test-org",
    plan: overrides?.plan ?? "free",
    settings: overrides?.settings ?? {},
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test organization: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
