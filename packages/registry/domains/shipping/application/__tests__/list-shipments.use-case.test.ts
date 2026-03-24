import { describe, it, expect, beforeEach } from "vitest";
import { ListShipments } from "../use-cases/list-shipments.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { createTestShipment } from "./fixtures/shipment.fixture.js";

describe("ListShipments", () => {
  let repo: InMemoryShipmentRepository;
  let useCase: ListShipments;

  beforeEach(() => {
    repo = new InMemoryShipmentRepository();
    useCase = new ListShipments(repo);
  });

  it("returns empty array when no shipments", async () => {
    const result = await useCase.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });

  it("returns all shipments mapped to output", async () => {
    await repo.save(createTestShipment({ id: "s1" }));
    await repo.save(createTestShipment({ id: "s2" }));

    const result = await useCase.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });
});
