import type { Result } from "../shared/result.js";
import type { ProfileNotFound } from "../domain/errors/profile-not-found.error.js";
import type { ProfileAlreadyExists } from "../domain/errors/profile-already-exists.error.js";
import type { InvalidDisplayName } from "../domain/errors/invalid-display-name.error.js";
import type { InvalidAvatarUrl } from "../domain/errors/invalid-avatar-url.error.js";
import type { InvalidBio } from "../domain/errors/invalid-bio.error.js";
import type { InvalidLocale } from "../domain/errors/invalid-locale.error.js";
import type { InvalidTimezone } from "../domain/errors/invalid-timezone.error.js";
import type { InvalidAddress } from "../domain/errors/invalid-address.error.js";

export interface UsersCreateProfileInput {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}

export interface UsersUpdateProfileInput {
  userId: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string;
}

export interface UsersUpdatePreferencesInput {
  userId: string;
  locale?: string;
  timezone?: string;
}

export interface UsersAddAddressInput {
  userId: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
}

export interface UsersRemoveAddressInput {
  userId: string;
  label: string;
}

export interface UsersProfileOutput {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  locale: string;
  timezone: string;
  addresses: Array<{
    label: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUsersService {
  createProfile(
    input: UsersCreateProfileInput,
  ): Promise<
    Result<
      { profileId: string },
      | ProfileAlreadyExists
      | InvalidDisplayName
      | InvalidAvatarUrl
      | InvalidBio
      | InvalidLocale
      | InvalidTimezone
    >
  >;
  getProfile(
    userId: string,
  ): Promise<Result<UsersProfileOutput, ProfileNotFound>>;
  updateProfile(
    input: UsersUpdateProfileInput,
  ): Promise<
    Result<
      UsersProfileOutput,
      ProfileNotFound | InvalidDisplayName | InvalidAvatarUrl | InvalidBio
    >
  >;
  updatePreferences(
    input: UsersUpdatePreferencesInput,
  ): Promise<
    Result<UsersProfileOutput, ProfileNotFound | InvalidLocale | InvalidTimezone>
  >;
  addAddress(
    input: UsersAddAddressInput,
  ): Promise<Result<UsersProfileOutput, ProfileNotFound | InvalidAddress>>;
  removeAddress(
    input: UsersRemoveAddressInput,
  ): Promise<Result<UsersProfileOutput, ProfileNotFound | InvalidAddress>>;
}
