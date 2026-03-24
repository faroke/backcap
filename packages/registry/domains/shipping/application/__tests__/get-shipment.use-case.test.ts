import { describe, it, expect, beforeEach } from "vitest";
import { GetShipment } from "../use-cases/get-shipment.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";

describe("GetShipment", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: GetShipment;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new GetShipment(repo);
  });

  it("returns shipment output for existing shipment", async () => {
    const shipment = createTestShipment();
    await repo.save(shipment);

    const result = await useCase.execute("shipment-1");
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.id).toBe("shipment-1");
    expect(output.orderId).toBe("order-1");
    expect(output.status).toBe("created");
  });

  it("fails with ShipmentNotFound for non-existent shipment", async () => {
    const result = await useCase.execute("xyz");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("ShipmentNotFound");
  });
});
