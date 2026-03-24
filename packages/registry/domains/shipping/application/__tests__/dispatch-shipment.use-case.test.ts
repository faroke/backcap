import { describe, it, expect, beforeEach } from "vitest";
import { DispatchShipment } from "../use-cases/dispatch-shipment.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";
import { TrackingNumber } from "../../domain/value-objects/tracking-number.vo.js";

describe("DispatchShipment", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: DispatchShipment;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new DispatchShipment(repo);
  });

  it("dispatches a created shipment with valid tracking number", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "ABC-123456");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.trackingNumber).toBe("ABC-123456");
  });

  it("fails for non-existent shipment", async () => {
    const result = await useCase.execute("nonexistent", "ABC-123456");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ShipmentNotFound");
  });

  it("fails for already dispatched shipment", async () => {
    const tracking = TrackingNumber.create("ABC-123456").unwrap();
    const shipment = createTestShipment({ status: "dispatched", trackingNumber: tracking });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "XYZ-789012");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
  });

  it("fails for invalid tracking number", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "BAD!");
    expect(result.isFail()).toBe(true);
  });
});
