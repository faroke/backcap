import { describe, it, expect } from "vitest";
import { InvalidActor } from "../errors/invalid-actor.error.js";
import { InvalidAction } from "../errors/invalid-action.error.js";
import { QueryFailed } from "../errors/query-failed.error.js";

describe("Activity domain errors", () => {
  describe("InvalidActor", () => {
    it("creates error with reason in message", () => {
      const error = InvalidActor.create("id must not be empty");
      expect(error).toBeInstanceOf(InvalidActor);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidActor");
      expect(error.message).toContain("id must not be empty");
    });
  });

  describe("InvalidAction", () => {
    it("creates error with value in message", () => {
      const error = InvalidAction.create("BAD_ACTION");
      expect(error).toBeInstanceOf(InvalidAction);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidAction");
      expect(error.message).toContain("BAD_ACTION");
    });
  });

  describe("QueryFailed", () => {
    it("creates error with reason in message", () => {
      const error = QueryFailed.create("connection timeout");
      expect(error).toBeInstanceOf(QueryFailed);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("QueryFailed");
      expect(error.message).toContain("connection timeout");
    });
  });
});
