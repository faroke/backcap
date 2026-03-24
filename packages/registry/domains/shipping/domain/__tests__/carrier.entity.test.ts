import { describe, it, expect } from "vitest";
import { Carrier } from "../entities/carrier.entity.js";
import { ShippingZone } from "../value-objects/shipping-zone.vo.js";

describe("Carrier", () => {
  it("creates carrier with defaults", () => {
    const result = Carrier.create({ id: "c1", name: "FedEx", code: "fedex" });
    expect(result.isOk()).toBe(true);
    const carrier = result.unwrap();
    expect(carrier.id).toBe("c1");
    expect(carrier.name).toBe("FedEx");
    expect(carrier.code).toBe("fedex");
    expect(carrier.active).toBe(true);
    expect(carrier.supportedZones).toHaveLength(0);
  });

  it("rejects empty id", () => {
    expect(Carrier.create({ id: "", name: "FedEx", code: "fedex" }).isFail()).toBe(true);
  });

  it("rejects empty name", () => {
    expect(Carrier.create({ id: "c1", name: "", code: "fedex" }).isFail()).toBe(true);
  });

  it("rejects empty code", () => {
    expect(Carrier.create({ id: "c1", name: "FedEx", code: "" }).isFail()).toBe(true);
  });

  it("rejects code with special characters", () => {
    expect(Carrier.create({ id: "c1", name: "FedEx", code: "Fed-Ex!" }).isFail()).toBe(true);
  });

  it("supportsZone() returns true when zone matches", () => {
    const zone = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();
    const carrier = Carrier.create({ id: "c1", name: "FedEx", code: "fedex", supportedZones: [zone] }).unwrap();
    expect(carrier.supportsZone(zone)).toBe(true);
  });

  it("supportsZone() returns false when zone does not match", () => {
    const zone = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();
    const otherZone = ShippingZone.create({ originCountry: "DE", destinationCountry: "US" }).unwrap();
    const carrier = Carrier.create({ id: "c1", name: "FedEx", code: "fedex", supportedZones: [zone] }).unwrap();
    expect(carrier.supportsZone(otherZone)).toBe(false);
  });

  it("deactivate() returns inactive carrier without mutating original", () => {
    const carrier = Carrier.create({ id: "c1", name: "FedEx", code: "fedex" }).unwrap();
    const deactivated = carrier.deactivate();
    expect(deactivated.active).toBe(false);
    expect(carrier.active).toBe(true);
  });

  it("activate() returns active carrier", () => {
    const carrier = Carrier.create({ id: "c1", name: "FedEx", code: "fedex", active: false }).unwrap();
    const activated = carrier.activate();
    expect(activated.active).toBe(true);
    expect(carrier.active).toBe(false);
  });
});
