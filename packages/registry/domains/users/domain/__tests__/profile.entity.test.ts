import { describe, it, expect } from "vitest";
import { Profile } from "../entities/profile.entity.js";
import { Address } from "../value-objects/address.vo.js";

describe("Profile", () => {
  const validParams = {
    id: "profile-1",
    userId: "user-1",
    displayName: "Jane Doe",
  };

  describe("create", () => {
    it("should create with defaults", () => {
      const result = Profile.create(validParams);
      expect(result.isOk()).toBe(true);
      const profile = result.unwrap();
      expect(profile.id).toBe("profile-1");
      expect(profile.userId).toBe("user-1");
      expect(profile.displayName.value).toBe("Jane Doe");
      expect(profile.avatarUrl).toBeNull();
      expect(profile.bio).toBe("");
      expect(profile.locale.value).toBe("en");
      expect(profile.timezone.value).toBe("UTC");
      expect(profile.addresses).toEqual([]);
    });

    it("should create with all fields", () => {
      const addr = Address.create({
        label: "Home",
        street: "123 Main",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      }).unwrap();

      const result = Profile.create({
        ...validParams,
        avatarUrl: "https://example.com/img.png",
        bio: "Hello world",
        locale: "fr-FR",
        timezone: "Europe/Paris",
        addresses: [addr],
      });
      expect(result.isOk()).toBe(true);
      const profile = result.unwrap();
      expect(profile.avatarUrl?.value).toBe("https://example.com/img.png");
      expect(profile.bio).toBe("Hello world");
      expect(profile.locale.value).toBe("fr-FR");
      expect(profile.timezone.value).toBe("Europe/Paris");
      expect(profile.addresses).toHaveLength(1);
    });

    it("should fail with invalid display name", () => {
      const result = Profile.create({ ...validParams, displayName: "" });
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidDisplayName");
    });

    it("should fail with invalid avatar URL", () => {
      const result = Profile.create({
        ...validParams,
        avatarUrl: "not-a-url",
      });
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidAvatarUrl");
    });

    it("should fail with bio over 2000 chars", () => {
      const result = Profile.create({
        ...validParams,
        bio: "a".repeat(2001),
      });
      expect(result.isFail()).toBe(true);
    });
  });

  describe("updateDisplayName", () => {
    it("should update successfully", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateDisplayName("New Name");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().displayName.value).toBe("New Name");
    });

    it("should fail with invalid name", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateDisplayName("");
      expect(result.isFail()).toBe(true);
    });
  });

  describe("updateAvatar", () => {
    it("should set avatar", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateAvatar("https://example.com/new.png");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().avatarUrl?.value).toBe(
        "https://example.com/new.png",
      );
    });

    it("should clear avatar with null", () => {
      const profile = Profile.create({
        ...validParams,
        avatarUrl: "https://example.com/img.png",
      }).unwrap();
      const result = profile.updateAvatar(null);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().avatarUrl).toBeNull();
    });

    it("should fail with invalid URL", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateAvatar("bad");
      expect(result.isFail()).toBe(true);
    });
  });

  describe("updateBio", () => {
    it("should update successfully", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateBio("New bio");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().bio).toBe("New bio");
    });

    it("should fail with bio over 2000 chars", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updateBio("a".repeat(2001));
      expect(result.isFail()).toBe(true);
    });
  });

  describe("updatePreferences", () => {
    it("should update locale and timezone", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updatePreferences({
        locale: "fr-FR",
        timezone: "Europe/Paris",
      });
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().locale.value).toBe("fr-FR");
      expect(result.unwrap().timezone.value).toBe("Europe/Paris");
    });

    it("should fail with invalid locale", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updatePreferences({ locale: "!!!" });
      expect(result.isFail()).toBe(true);
    });

    it("should fail with invalid timezone", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.updatePreferences({ timezone: "Bad/Zone" });
      expect(result.isFail()).toBe(true);
    });
  });

  describe("addAddress", () => {
    it("should add address successfully", () => {
      const profile = Profile.create(validParams).unwrap();
      const address = Address.create({
        label: "Home",
        street: "123 Main",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      }).unwrap();
      const result = profile.addAddress(address);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().addresses).toHaveLength(1);
    });

    it("should reject duplicate label (case-insensitive)", () => {
      const profile = Profile.create(validParams).unwrap();
      const addr1 = Address.create({
        label: "Home",
        street: "123 Main",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      }).unwrap();
      const withAddr = profile.addAddress(addr1).unwrap();

      const addr2 = Address.create({
        label: "home",
        street: "456 Other",
        city: "Lyon",
        postalCode: "69001",
        country: "FR",
      }).unwrap();
      const result = withAddr.addAddress(addr2);
      expect(result.isFail()).toBe(true);
    });

    it("should reject when at max 10 addresses", () => {
      let profile = Profile.create(validParams).unwrap();
      for (let i = 0; i < 10; i++) {
        const addr = Address.create({
          label: `Addr${i}`,
          street: "St",
          city: "City",
          postalCode: "00000",
          country: "FR",
        }).unwrap();
        profile = profile.addAddress(addr).unwrap();
      }
      const extra = Address.create({
        label: "Extra",
        street: "St",
        city: "City",
        postalCode: "00000",
        country: "FR",
      }).unwrap();
      const result = profile.addAddress(extra);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("removeAddress", () => {
    it("should remove address by label", () => {
      const profile = Profile.create(validParams).unwrap();
      const addr = Address.create({
        label: "Home",
        street: "123 Main",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      }).unwrap();
      const withAddr = profile.addAddress(addr).unwrap();
      const result = withAddr.removeAddress("Home");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().addresses).toHaveLength(0);
    });

    it("should fail when label not found", () => {
      const profile = Profile.create(validParams).unwrap();
      const result = profile.removeAddress("Office");
      expect(result.isFail()).toBe(true);
    });
  });

  describe("immutability", () => {
    it("should not mutate original after update", () => {
      const original = Profile.create(validParams).unwrap();
      const updated = original.updateDisplayName("New Name").unwrap();
      expect(original.displayName.value).toBe("Jane Doe");
      expect(updated.displayName.value).toBe("New Name");
    });
  });
});
