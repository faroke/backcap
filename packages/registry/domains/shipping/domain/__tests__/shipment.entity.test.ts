import { describe, it, expect } from "vitest";
import { Shipment } from "../entities/shipment.entity.js";
import { ShippingZone } from "../value-objects/shipping-zone.vo.js";
import { TrackingNumber } from "../value-objects/tracking-number.vo.js";

const defaultZone = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();

function createShipment(overrides?: Record<string, unknown>) {
  return Shipment.create({
    id: "s1",
    orderId: "o1",
    carrierId: "c1",
    zone: defaultZone,
    weightGrams: 500,
    ...overrides,
  });
}

describe("Shipment", () => {
  it("creates shipment with defaults", () => {
    const result = createShipment();
    expect(result.isOk()).toBe(true);
    const s = result.unwrap();
    expect(s.status.isCreated()).toBe(true);
    expect(s.trackingNumber).toBeNull();
    expect(s.rateCents).toBeNull();
    expect(s.cancelReason).toBeNull();
  });

  it("rejects empty id", () => {
    expect(createShipment({ id: "" }).isFail()).toBe(true);
  });

  it("rejects empty orderId", () => {
    expect(createShipment({ orderId: "" }).isFail()).toBe(true);
  });

  it("rejects empty carrierId", () => {
    expect(createShipment({ carrierId: "" }).isFail()).toBe(true);
  });

  it("rejects non-positive weightGrams", () => {
    expect(createShipment({ weightGrams: 0 }).isFail()).toBe(true);
    expect(createShipment({ weightGrams: -1 }).isFail()).toBe(true);
    expect(createShipment({ weightGrams: 1.5 }).isFail()).toBe(true);
  });

  it("creates with valid status string", () => {
    const result = createShipment({ status: "dispatched" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status.isDispatched()).toBe(true);
  });

  it("rejects invalid status string", () => {
    const result = createShipment({ status: "invalid" });
    expect(result.isFail()).toBe(true);
  });

  describe("state transitions", () => {
    it("full lifecycle: created -> dispatch -> markInTransit -> deliver", () => {
      const tracking = TrackingNumber.create("ABC-123456").unwrap();
      const s = createShipment().unwrap();

      const dispatched = s.dispatch(tracking).unwrap();
      expect(dispatched.status.isDispatched()).toBe(true);
      expect(dispatched.trackingNumber?.value).toBe("ABC-123456");

      const inTransit = dispatched.markInTransit().unwrap();
      expect(inTransit.status.isInTransit()).toBe(true);

      const delivered = inTransit.deliver().unwrap();
      expect(delivered.status.isDelivered()).toBe(true);
    });

    it("cancel from created", () => {
      const s = createShipment().unwrap();
      const canceled = s.cancel("no longer needed").unwrap();
      expect(canceled.status.isCanceled()).toBe(true);
      expect(canceled.cancelReason).toBe("no longer needed");
    });

    it("cancel from dispatched", () => {
      const tracking = TrackingNumber.create("ABC-123456").unwrap();
      const s = createShipment().unwrap().dispatch(tracking).unwrap();
      const canceled = s.cancel("customer request").unwrap();
      expect(canceled.status.isCanceled()).toBe(true);
    });

    it("cancel without reason sets cancelReason to null", () => {
      const s = createShipment().unwrap();
      const canceled = s.cancel().unwrap();
      expect(canceled.cancelReason).toBeNull();
    });

    it("created cannot markInTransit", () => {
      const s = createShipment().unwrap();
      const result = s.markInTransit();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
    });

    it("in_transit cannot cancel", () => {
      const tracking = TrackingNumber.create("ABC-123456").unwrap();
      const s = createShipment().unwrap().dispatch(tracking).unwrap().markInTransit().unwrap();
      const result = s.cancel();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
    });

    it("delivered cannot cancel", () => {
      const tracking = TrackingNumber.create("ABC-123456").unwrap();
      const s = createShipment().unwrap().dispatch(tracking).unwrap().markInTransit().unwrap().deliver().unwrap();
      const result = s.cancel();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
    });
  });

  it("dispatch does not mutate original (immutability)", () => {
    const tracking = TrackingNumber.create("ABC-123456").unwrap();
    const original = createShipment().unwrap();
    original.dispatch(tracking);
    expect(original.status.isCreated()).toBe(true);
    expect(original.trackingNumber).toBeNull();
  });

  it("assignRate sets rate fields", () => {
    const s = createShipment().unwrap();
    const result = s.assignRate(1500, "USD");
    expect(result.isOk()).toBe(true);
    const rated = result.unwrap();
    expect(rated.rateCents).toBe(1500);
    expect(rated.rateCurrency).toBe("USD");
  });

  it("assignRate rejects negative rateCents", () => {
    const s = createShipment().unwrap();
    expect(s.assignRate(-1, "USD").isFail()).toBe(true);
  });

  it("assignRate rejects invalid currency", () => {
    const s = createShipment().unwrap();
    expect(s.assignRate(100, "ABCD").isFail()).toBe(true);
  });

  it("assignEstimatedDelivery sets date", () => {
    const s = createShipment().unwrap();
    const future = new Date(Date.now() + 86400000);
    const result = s.assignEstimatedDelivery(future);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().estimatedDeliveryDate).toEqual(future);
  });

  it("assignEstimatedDelivery rejects past date", () => {
    const s = createShipment().unwrap();
    const past = new Date(Date.now() - 86400000);
    expect(s.assignEstimatedDelivery(past).isFail()).toBe(true);
  });
});
