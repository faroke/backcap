import type { Result } from "../shared/result.js";

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
  ): Promise<Result<{ profileId: string }, Error>>;
  getProfile(userId: string): Promise<Result<UsersProfileOutput, Error>>;
  updateProfile(
    input: UsersUpdateProfileInput,
  ): Promise<Result<UsersProfileOutput, Error>>;
  updatePreferences(
    input: UsersUpdatePreferencesInput,
  ): Promise<Result<UsersProfileOutput, Error>>;
  addAddress(
    input: UsersAddAddressInput,
  ): Promise<Result<UsersProfileOutput, Error>>;
  removeAddress(
    input: UsersRemoveAddressInput,
  ): Promise<Result<UsersProfileOutput, Error>>;
}
