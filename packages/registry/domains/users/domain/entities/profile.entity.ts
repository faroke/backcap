import { Result } from "../../shared/result.js";
import { DisplayName } from "../value-objects/display-name.vo.js";
import { Avatar } from "../value-objects/avatar.vo.js";
import { Timezone } from "../value-objects/timezone.vo.js";
import { Locale } from "../value-objects/locale.vo.js";
import { Address } from "../value-objects/address.vo.js";
import { InvalidDisplayName } from "../errors/invalid-display-name.error.js";
import { InvalidAvatarUrl } from "../errors/invalid-avatar-url.error.js";
import { InvalidAddress } from "../errors/invalid-address.error.js";

export class Profile {
  readonly id: string;
  readonly userId: string;
  readonly displayName: DisplayName;
  readonly avatarUrl: Avatar | null;
  readonly bio: string;
  readonly locale: Locale;
  readonly timezone: Timezone;
  readonly addresses: Address[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    displayName: DisplayName,
    avatarUrl: Avatar | null,
    bio: string,
    locale: Locale,
    timezone: Timezone,
    addresses: Address[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
    this.bio = bio;
    this.locale = locale;
    this.timezone = timezone;
    this.addresses = addresses;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
    bio?: string;
    locale?: string;
    timezone?: string;
    addresses?: Address[];
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Profile, Error> {
    const displayNameResult = DisplayName.create(params.displayName);
    if (displayNameResult.isFail()) {
      return Result.fail(displayNameResult.unwrapError());
    }

    let avatar: Avatar | null = null;
    if (params.avatarUrl) {
      const avatarResult = Avatar.create(params.avatarUrl);
      if (avatarResult.isFail()) {
        return Result.fail(avatarResult.unwrapError());
      }
      avatar = avatarResult.unwrap();
    }

    const bio = params.bio ?? "";
    if (bio.length > 2000) {
      return Result.fail(new Error("Bio must not exceed 2000 characters"));
    }

    const localeResult = Locale.create(params.locale ?? "en");
    if (localeResult.isFail()) {
      return Result.fail(localeResult.unwrapError());
    }

    const timezoneResult = Timezone.create(params.timezone ?? "UTC");
    if (timezoneResult.isFail()) {
      return Result.fail(timezoneResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new Profile(
        params.id,
        params.userId,
        displayNameResult.unwrap(),
        avatar,
        bio,
        localeResult.unwrap(),
        timezoneResult.unwrap(),
        params.addresses ?? [],
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  updateDisplayName(newName: string): Result<Profile, InvalidDisplayName> {
    const result = DisplayName.create(newName);
    if (result.isFail()) {
      return Result.fail(result.unwrapError());
    }
    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        result.unwrap(),
        this.avatarUrl,
        this.bio,
        this.locale,
        this.timezone,
        this.addresses,
        this.createdAt,
        new Date(),
      ),
    );
  }

  updateAvatar(newUrl: string | null): Result<Profile, InvalidAvatarUrl> {
    if (newUrl === null) {
      return Result.ok(
        new Profile(
          this.id,
          this.userId,
          this.displayName,
          null,
          this.bio,
          this.locale,
          this.timezone,
          this.addresses,
          this.createdAt,
          new Date(),
        ),
      );
    }
    const result = Avatar.create(newUrl);
    if (result.isFail()) {
      return Result.fail(result.unwrapError());
    }
    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        this.displayName,
        result.unwrap(),
        this.bio,
        this.locale,
        this.timezone,
        this.addresses,
        this.createdAt,
        new Date(),
      ),
    );
  }

  updateBio(newBio: string): Result<Profile, Error> {
    if (newBio.length > 2000) {
      return Result.fail(new Error("Bio must not exceed 2000 characters"));
    }
    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        this.displayName,
        this.avatarUrl,
        newBio,
        this.locale,
        this.timezone,
        this.addresses,
        this.createdAt,
        new Date(),
      ),
    );
  }

  updatePreferences(params: {
    locale?: string;
    timezone?: string;
  }): Result<Profile, Error> {
    let locale = this.locale;
    if (params.locale !== undefined) {
      const localeResult = Locale.create(params.locale);
      if (localeResult.isFail()) {
        return Result.fail(localeResult.unwrapError());
      }
      locale = localeResult.unwrap();
    }

    let timezone = this.timezone;
    if (params.timezone !== undefined) {
      const timezoneResult = Timezone.create(params.timezone);
      if (timezoneResult.isFail()) {
        return Result.fail(timezoneResult.unwrapError());
      }
      timezone = timezoneResult.unwrap();
    }

    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        this.displayName,
        this.avatarUrl,
        this.bio,
        locale,
        timezone,
        this.addresses,
        this.createdAt,
        new Date(),
      ),
    );
  }

  addAddress(address: Address): Result<Profile, InvalidAddress> {
    const duplicate = this.addresses.find(
      (a) => a.label.toLowerCase() === address.label.toLowerCase(),
    );
    if (duplicate) {
      return Result.fail(
        InvalidAddress.create(
          `Address with label '${address.label}' already exists`,
        ),
      );
    }
    if (this.addresses.length >= 10) {
      return Result.fail(
        InvalidAddress.create("Maximum of 10 addresses reached"),
      );
    }
    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        this.displayName,
        this.avatarUrl,
        this.bio,
        this.locale,
        this.timezone,
        [...this.addresses, address],
        this.createdAt,
        new Date(),
      ),
    );
  }

  removeAddress(label: string): Result<Profile, InvalidAddress> {
    const index = this.addresses.findIndex(
      (a) => a.label.toLowerCase() === label.toLowerCase(),
    );
    if (index === -1) {
      return Result.fail(
        InvalidAddress.create(`Address with label '${label}' not found`),
      );
    }
    const newAddresses = this.addresses.filter((_, i) => i !== index);
    return Result.ok(
      new Profile(
        this.id,
        this.userId,
        this.displayName,
        this.avatarUrl,
        this.bio,
        this.locale,
        this.timezone,
        newAddresses,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
