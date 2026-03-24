import { describe, it, expect } from "vitest";
import { Actor } from "../value-objects/actor.vo.js";
import { InvalidActor } from "../errors/invalid-actor.error.js";

describe("Actor VO", () => {
  it("creates a valid Actor with id and displayName", () => {
    const result = Actor.create({ id: "user-123", displayName: "Marie" });
    expect(result.isOk()).toBe(true);
    const actor = result.unwrap();
    expect(actor.id).toBe("user-123");
    expect(actor.displayName).toBe("Marie");
  });

  it("rejects empty id", () => {
    const result = Actor.create({ id: "", displayName: "Marie" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });

  it("rejects whitespace-only id", () => {
    const result = Actor.create({ id: "   ", displayName: "Marie" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });

  it("rejects empty displayName", () => {
    const result = Actor.create({ id: "user-123", displayName: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });

  it("rejects whitespace-only displayName", () => {
    const result = Actor.create({ id: "user-123", displayName: "   " });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });

  it("trims whitespace from id and displayName", () => {
    const result = Actor.create({ id: "  user-123  ", displayName: "  Marie  " });
    expect(result.isOk()).toBe(true);
    const actor = result.unwrap();
    expect(actor.id).toBe("user-123");
    expect(actor.displayName).toBe("Marie");
  });
});
