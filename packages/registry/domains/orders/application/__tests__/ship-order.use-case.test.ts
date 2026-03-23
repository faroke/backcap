import { describe, it, expect, beforeEach } from "vitest";
import { ShipOrder } from "../use-cases/ship-order.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";
import { createTestOrder } from "./fixtures/order.fixture.js";

describe("ShipOrder use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let shipOrder: ShipOrder;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    shipOrder = new ShipOrder(orderRepo);
  });

  it("ships a processing order", async () => {
    const order = createTestOrder({ status: "processing" });
    await orderRepo.save(order);

    const result = await shipOrder.execute(order.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.orderId).toBe(order.id);

    const updated = await orderRepo.findById(order.id);
    expect(updated!.status.isShipped()).toBe(true);
  });

  it("fails for non-existent order", async () => {
    const result = await shipOrder.execute("no-order");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("OrderNotFound");
  });

  it("fails for pending order", async () => {
    const order = createTestOrder();
    await orderRepo.save(order);

    const result = await shipOrder.execute(order.id);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidOrderTransition");
  });
});
