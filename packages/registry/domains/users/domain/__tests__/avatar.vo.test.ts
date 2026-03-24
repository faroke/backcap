import { describe, it, expect } from "vitest";
import { Avatar } from "../value-objects/avatar.vo.js";

describe("Avatar", () => {
  it("should create with valid https URL", () => {
    const result = Avatar.create("https://example.com/photo.jpg");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("https://example.com/photo.jpg");
  });

  it("should create with valid http URL", () => {
    const result = Avatar.create("http://example.com/photo.jpg");
    expect(result.isOk()).toBe(true);
  });

  it("should reject empty string", () => {
    const result = Avatar.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidAvatarUrl");
  });

  it("should reject non-URL string", () => {
    const result = Avatar.create("not-a-url");
    expect(result.isFail()).toBe(true);
  });

  it("should reject URL over 2048 characters", () => {
    const result = Avatar.create("https://example.com/" + "a".repeat(2030));
    expect(result.isFail()).toBe(true);
  });

  it("should have immutable value", () => {
    const avatar = Avatar.create("https://example.com/img.png").unwrap();
    expect(avatar.value).toBe("https://example.com/img.png");
  });
});
