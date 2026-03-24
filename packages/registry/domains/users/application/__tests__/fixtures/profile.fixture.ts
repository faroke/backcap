import { Profile } from "../../../domain/entities/profile.entity.js";

export function createTestProfile(
  overrides?: Partial<{
    id: string;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string;
    locale: string;
    timezone: string;
  }>,
): Profile {
  const result = Profile.create({
    id: overrides?.id ?? "test-profile-1",
    userId: overrides?.userId ?? "test-user-1",
    displayName: overrides?.displayName ?? "Test User",
    avatarUrl: overrides?.avatarUrl,
    bio: overrides?.bio,
    locale: overrides?.locale,
    timezone: overrides?.timezone,
  });

  if (result.isFail()) {
    throw new Error(
      `Failed to create test profile: ${result.unwrapError().message}`,
    );
  }

  return result.unwrap();
}
