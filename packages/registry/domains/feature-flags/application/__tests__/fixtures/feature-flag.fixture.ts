import { FeatureFlag } from "../../../domain/entities/feature-flag.entity.js";

export function createTestFlag(
  overrides?: Partial<{
    id: string;
    key: string;
    isEnabled: boolean;
    conditions: Record<string, unknown>;
  }>,
): FeatureFlag {
  const result = FeatureFlag.create({
    id: overrides?.id ?? "test-flag-1",
    key: overrides?.key ?? "test-flag",
    isEnabled: overrides?.isEnabled ?? false,
    conditions: overrides?.conditions,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test flag: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

export function createTestEnabledFlag(
  overrides?: Partial<{
    id: string;
    key: string;
    conditions: Record<string, unknown>;
  }>,
): FeatureFlag {
  return createTestFlag({ ...overrides, isEnabled: true });
}
