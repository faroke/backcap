import { describe, it, expect } from "vitest";
import { ShipmentStatus } from "../value-objects/shipment-status.vo.js";

describe("ShipmentStatus", () => {
  it("creates each status via named constructor", () => {
    expect(ShipmentStatus.created().value).toBe("created");
    expect(ShipmentStatus.dispatched().value).toBe("dispatched");
    expect(ShipmentStatus.inTransit().value).toBe("in_transit");
    expect(ShipmentStatus.delivered().value).toBe("delivered");
    expect(ShipmentStatus.canceled().value).toBe("canceled");
  });

  it("from() accepts valid strings", () => {
    const result = ShipmentStatus.from("dispatched");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("dispatched");
  });

  it("from() rejects invalid strings", () => {
    const result = ShipmentStatus.from("unknown");
    expect(result.isFail()).toBe(true);
  });

  describe("canTransitionTo", () => {
    it("created can transition to dispatched and canceled", () => {
      const status = ShipmentStatus.created();
      expect(status.canTransitionTo("dispatched")).toBe(true);
      expect(status.canTransitionTo("canceled")).toBe(true);
      expect(status.canTransitionTo("in_transit")).toBe(false);
      expect(status.canTransitionTo("delivered")).toBe(false);
    });

    it("dispatched can transition to in_transit and canceled", () => {
      const status = ShipmentStatus.dispatched();
      expect(status.canTransitionTo("in_transit")).toBe(true);
      expect(status.canTransitionTo("canceled")).toBe(true);
      expect(status.canTransitionTo("created")).toBe(false);
      expect(status.canTransitionTo("delivered")).toBe(false);
    });

    it("in_transit can only transition to delivered", () => {
      const status = ShipmentStatus.inTransit();
      expect(status.canTransitionTo("delivered")).toBe(true);
      expect(status.canTransitionTo("canceled")).toBe(false);
      expect(status.canTransitionTo("dispatched")).toBe(false);
    });

    it("delivered is a terminal state", () => {
      const status = ShipmentStatus.delivered();
      expect(status.canTransitionTo("created")).toBe(false);
      expect(status.canTransitionTo("canceled")).toBe(false);
    });

    it("canceled is a terminal state", () => {
      const status = ShipmentStatus.canceled();
      expect(status.canTransitionTo("created")).toBe(false);
      expect(status.canTransitionTo("delivered")).toBe(false);
    });
  });

  it("boolean checkers return correct values", () => {
    expect(ShipmentStatus.created().isCreated()).toBe(true);
    expect(ShipmentStatus.created().isDispatched()).toBe(false);
    expect(ShipmentStatus.dispatched().isDispatched()).toBe(true);
    expect(ShipmentStatus.inTransit().isInTransit()).toBe(true);
    expect(ShipmentStatus.delivered().isDelivered()).toBe(true);
    expect(ShipmentStatus.canceled().isCanceled()).toBe(true);
  });

  it("equals() works correctly", () => {
    expect(ShipmentStatus.created().equals(ShipmentStatus.created())).toBe(true);
    expect(ShipmentStatus.created().equals(ShipmentStatus.dispatched())).toBe(false);
  });
});
