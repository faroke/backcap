import { describe, it, expect } from "vitest";
import { ReservationStatus } from "../value-objects/reservation-status.vo.js";

describe("ReservationStatus VO", () => {
  it("creates pending status", () => {
    const status = ReservationStatus.pending();
    expect(status.value).toBe("pending");
    expect(status.isPending()).toBe(true);
  });

  it("creates confirmed status", () => {
    const status = ReservationStatus.confirmed();
    expect(status.value).toBe("confirmed");
    expect(status.isConfirmed()).toBe(true);
  });

  it("creates released status", () => {
    const status = ReservationStatus.released();
    expect(status.value).toBe("released");
    expect(status.isReleased()).toBe(true);
  });

  it("creates expired status", () => {
    const status = ReservationStatus.expired();
    expect(status.value).toBe("expired");
    expect(status.isExpired()).toBe(true);
  });

  it("from() parses valid strings", () => {
    for (const value of ["pending", "confirmed", "released", "expired"]) {
      const result = ReservationStatus.from(value);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe(value);
    }
  });

  it("from() fails on invalid strings", () => {
    const result = ReservationStatus.from("invalid");
    expect(result.isFail()).toBe(true);
  });

  it("boolean checkers return correct values", () => {
    const pending = ReservationStatus.pending();
    expect(pending.isPending()).toBe(true);
    expect(pending.isConfirmed()).toBe(false);
    expect(pending.isReleased()).toBe(false);
    expect(pending.isExpired()).toBe(false);
  });

  it("equals() comparison", () => {
    const a = ReservationStatus.pending();
    const b = ReservationStatus.pending();
    const c = ReservationStatus.confirmed();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
