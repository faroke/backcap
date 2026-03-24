import { describe, it, expect } from "vitest";
import { ShippingZone } from "../value-objects/shipping-zone.vo.js";

describe("ShippingZone", () => {
  it("creates a valid zone", () => {
    const result = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" });
    expect(result.isOk()).toBe(true);
    const zone = result.unwrap();
    expect(zone.originCountry).toBe("FR");
    expect(zone.destinationCountry).toBe("US");
  });

  it("uppercases country codes", () => {
    const result = ShippingZone.create({ originCountry: "fr", destinationCountry: "us" });
    expect(result.isOk()).toBe(true);
    const zone = result.unwrap();
    expect(zone.originCountry).toBe("FR");
    expect(zone.destinationCountry).toBe("US");
  });

  it("isDomestic() returns true when origin === destination", () => {
    const zone = ShippingZone.create({ originCountry: "FR", destinationCountry: "FR" }).unwrap();
    expect(zone.isDomestic()).toBe(true);
  });

  it("isDomestic() returns false for international", () => {
    const zone = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();
    expect(zone.isDomestic()).toBe(false);
  });

  it("rejects empty origin", () => {
    const result = ShippingZone.create({ originCountry: "", destinationCountry: "US" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects single-char code", () => {
    const result = ShippingZone.create({ originCountry: "F", destinationCountry: "US" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects 3-char code", () => {
    const result = ShippingZone.create({ originCountry: "FRA", destinationCountry: "US" });
    expect(result.isFail()).toBe(true);
  });

  it("rejects numeric codes", () => {
    const result = ShippingZone.create({ originCountry: "12", destinationCountry: "US" });
    expect(result.isFail()).toBe(true);
  });

  it("equals() works correctly", () => {
    const a = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();
    const b = ShippingZone.create({ originCountry: "fr", destinationCountry: "us" }).unwrap();
    const c = ShippingZone.create({ originCountry: "DE", destinationCountry: "US" }).unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
