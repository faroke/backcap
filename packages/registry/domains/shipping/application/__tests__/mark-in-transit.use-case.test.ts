import { describe, it, expect, beforeEach } from "vitest";
import { MarkInTransit } from "../use-cases/mark-in-transit.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";
import { TrackingNumber } from "../../domain/value-objects/tracking-number.vo.js";

describe("MarkInTransit", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: MarkInTransit;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new MarkInTransit(repo);
  });

  it("marks a dispatched shipment as in transit", async () => {
    const tracking = TrackingNumber.create("ABC-123456").unwrap();
    const shipment = createTestShipment({ status: "dispatched", trackingNumber: tracking });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.shipmentId).toBe("shipment-1");
  });

  it("fails for non-existent shipment", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ShipmentNotFound");
  });

  it("fails for created shipment (not dispatched)", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
  });
});
