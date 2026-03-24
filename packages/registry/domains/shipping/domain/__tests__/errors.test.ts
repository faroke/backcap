import { describe, it, expect } from "vitest";
import { ShipmentNotFound } from "../errors/shipment-not-found.error.js";
import { CarrierNotFound } from "../errors/carrier-not-found.error.js";
import { InvalidShipmentTransition } from "../errors/invalid-shipment-transition.error.js";
import { InvalidTrackingNumber } from "../errors/invalid-tracking-number.error.js";
import { NoRateAvailable } from "../errors/no-rate-available.error.js";

describe("Domain Errors", () => {
  it("ShipmentNotFound sets correct name and message", () => {
    const error = ShipmentNotFound.create("s1");
    expect(error.name).toBe("ShipmentNotFound");
    expect(error.message).toContain("s1");
  });

  it("CarrierNotFound sets correct name and message", () => {
    const error = CarrierNotFound.create("c1");
    expect(error.name).toBe("CarrierNotFound");
    expect(error.message).toContain("c1");
  });

  it("InvalidShipmentTransition sets correct name and message", () => {
    const error = InvalidShipmentTransition.create("created", "delivered");
    expect(error.name).toBe("InvalidShipmentTransition");
    expect(error.message).toContain("created");
    expect(error.message).toContain("delivered");
  });

  it("InvalidTrackingNumber sets correct name and message", () => {
    const error = InvalidTrackingNumber.create("bad!");
    expect(error.name).toBe("InvalidTrackingNumber");
    expect(error.message).toContain("bad!");
  });

  it("NoRateAvailable sets correct name and message without carrierId", () => {
    const error = NoRateAvailable.create("FR-US");
    expect(error.name).toBe("NoRateAvailable");
    expect(error.message).toContain("FR-US");
  });

  it("NoRateAvailable sets correct name and message with carrierId", () => {
    const error = NoRateAvailable.create("FR-US", "fedex");
    expect(error.name).toBe("NoRateAvailable");
    expect(error.message).toContain("fedex");
    expect(error.message).toContain("FR-US");
  });
});
