import { describe, it, expect, beforeEach } from "vitest";
import { DeliverShipment } from "../use-cases/deliver-shipment.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";

describe("DeliverShipment", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: DeliverShipment;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new DeliverShipment(repo);
  });

  it("delivers an in-transit shipment", async () => {
    const shipment = createTestShipment({ status: "in_transit" });
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

  it("fails for dispatched shipment (not in transit)", async () => {
    const shipment = createTestShipment({ status: "dispatched" });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
  });
});
