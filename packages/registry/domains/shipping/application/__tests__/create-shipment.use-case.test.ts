import { describe, it, expect, beforeEach } from "vitest";
import { CreateShipment } from "../use-cases/create-shipment.use-case.js";
import { InMemoryShipmentRepository } from "./mocks/shipment-repository.mock.js";
import { InMemoryCarrierRepository } from "./mocks/carrier-repository.mock.js";
import { createTestCarrier } from "./fixtures/carrier.fixture.js";

describe("CreateShipment", () => {
  let shipmentRepo: InMemoryShipmentRepository;
  let carrierRepo: InMemoryCarrierRepository;
  let useCase: CreateShipment;

  beforeEach(() => {
    shipmentRepo = new InMemoryShipmentRepository();
    carrierRepo = new InMemoryCarrierRepository();
    useCase = new CreateShipment(shipmentRepo, carrierRepo);
  });

  it("creates shipment with valid input", async () => {
    const carrier = createTestCarrier();
    await carrierRepo.save(carrier);

    const result = await useCase.execute({
      orderId: "order-1",
      carrierId: "carrier-1",
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isOk()).toBe(true);
    const { shipmentId, event } = result.unwrap();
    expect(shipmentId).toBeDefined();
    expect(event.shipmentId).toBe(shipmentId);
    expect(event.orderId).toBe("order-1");
    expect(event.carrierId).toBe("carrier-1");
  });

  it("fails when carrier not found", async () => {
    const result = await useCase.execute({
      orderId: "order-1",
      carrierId: "nonexistent",
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CarrierNotFound");
  });

  it("fails when carrier is inactive", async () => {
    const carrier = createTestCarrier({ active: false });
    await carrierRepo.save(carrier);

    const result = await useCase.execute({
      orderId: "order-1",
      carrierId: "carrier-1",
      originCountry: "FR",
      destinationCountry: "US",
      weightGrams: 500,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("not active");
  });
});
