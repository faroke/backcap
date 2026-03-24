import { describe, it, expect, beforeEach } from "vitest";
import { CancelShipment } from "../use-cases/cancel-shipment.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";

describe("CancelShipment", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: CancelShipment;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new CancelShipment(repo);
  });

  it("cancels a created shipment", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "no longer needed");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.reason).toBe("no longer needed");
  });

  it("cancels a dispatched shipment", async () => {
    const shipment = createTestShipment({ status: "dispatched" });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "customer request");
    expect(result.isOk()).toBe(true);
  });

  it("returns event with reason", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1", "wrong address");
    expect(result.unwrap().event.reason).toBe("wrong address");
  });

  it("fails for non-existent shipment", async () => {
    const result = await useCase.execute("nonexistent");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ShipmentNotFound");
  });

  it("fails for in-transit shipment", async () => {
    const shipment = createTestShipment({ status: "in_transit" });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
  });

  it("fails for delivered shipment", async () => {
    const shipment = createTestShipment({ status: "delivered" });
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidShipmentTransition");
  });
});
