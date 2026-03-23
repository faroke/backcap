import { User } from "../../../domain/entities/user.entity.js";

export function createTestUser(
  overrides?: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    roles: string[];
  }>,
): User {
  const result = User.create({
    id: overrides?.id ?? "test-user-1",
    email: overrides?.email ?? "test@example.com",
    passwordHash: overrides?.passwordHash ?? "hashed:password123",
    roles: overrides?.roles ?? ["user"],
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test user: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
