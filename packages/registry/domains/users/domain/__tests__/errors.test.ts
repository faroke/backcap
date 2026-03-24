import { describe, it, expect } from "vitest";
import { ProfileNotFound } from "../errors/profile-not-found.error.js";
import { InvalidDisplayName } from "../errors/invalid-display-name.error.js";
import { InvalidAvatarUrl } from "../errors/invalid-avatar-url.error.js";
import { InvalidTimezone } from "../errors/invalid-timezone.error.js";
import { InvalidLocale } from "../errors/invalid-locale.error.js";
import { InvalidAddress } from "../errors/invalid-address.error.js";

describe("ProfileNotFound", () => {
  it("should create via static factory", () => {
    const error = ProfileNotFound.create("user-123");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ProfileNotFound);
    expect(error.name).toBe("ProfileNotFound");
    expect(error.message).toContain("user-123");
  });
});

describe("InvalidDisplayName", () => {
  it("should create via static factory", () => {
    const error = InvalidDisplayName.create("bad");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidDisplayName);
    expect(error.name).toBe("InvalidDisplayName");
    expect(error.message).toContain("bad");
  });
});

describe("InvalidAvatarUrl", () => {
  it("should create via static factory", () => {
    const error = InvalidAvatarUrl.create("bad-url");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidAvatarUrl);
    expect(error.name).toBe("InvalidAvatarUrl");
    expect(error.message).toContain("bad-url");
  });
});

describe("InvalidTimezone", () => {
  it("should create via static factory", () => {
    const error = InvalidTimezone.create("Bad/Zone");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidTimezone);
    expect(error.name).toBe("InvalidTimezone");
    expect(error.message).toContain("Bad/Zone");
  });
});

describe("InvalidLocale", () => {
  it("should create via static factory", () => {
    const error = InvalidLocale.create("xyz");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidLocale);
    expect(error.name).toBe("InvalidLocale");
    expect(error.message).toContain("xyz");
  });
});

describe("InvalidAddress", () => {
  it("should create via static factory", () => {
    const error = InvalidAddress.create("missing field");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidAddress);
    expect(error.name).toBe("InvalidAddress");
    expect(error.message).toContain("missing field");
  });
});
