import { describe, it, expect } from "vitest";
import { ShipmentCreated } from "../events/shipment-created.event.js";
import { ShipmentDispatched } from "../events/shipment-dispatched.event.js";
import { ShipmentInTransit } from "../events/shipment-in-transit.event.js";
import { ShipmentDelivered } from "../events/shipment-delivered.event.js";
import { ShipmentCanceled } from "../events/shipment-canceled.event.js";

describe("Domain Events", () => {
  it("ShipmentCreated stores fields correctly", () => {
    const event = new ShipmentCreated("s1", "o1", "c1");
    expect(event.shipmentId).toBe("s1");
    expect(event.orderId).toBe("o1");
    expect(event.carrierId).toBe("c1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("ShipmentDispatched stores fields correctly", () => {
    const event = new ShipmentDispatched("s1", "TRK-123456");
    expect(event.shipmentId).toBe("s1");
    expect(event.trackingNumber).toBe("TRK-123456");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("ShipmentInTransit stores fields correctly", () => {
    const event = new ShipmentInTransit("s1");
    expect(event.shipmentId).toBe("s1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("ShipmentDelivered stores fields correctly", () => {
    const now = new Date();
    const event = new ShipmentDelivered("s1", now);
    expect(event.shipmentId).toBe("s1");
    expect(event.deliveredAt).toEqual(now);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("ShipmentCanceled stores fields correctly", () => {
    const event = new ShipmentCanceled("s1", "no longer needed");
    expect(event.shipmentId).toBe("s1");
    expect(event.reason).toBe("no longer needed");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});
