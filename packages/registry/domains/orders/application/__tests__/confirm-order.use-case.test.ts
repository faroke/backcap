import { describe, it, expect, beforeEach } from "vitest";
import { ConfirmOrder } from "../use-cases/confirm-order.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";
import { createTestOrder } from "./fixtures/order.fixture.js";

describe("ConfirmOrder use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let confirmOrder: ConfirmOrder;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    confirmOrder = new ConfirmOrder(orderRepo);
  });

  it("confirms a pending order", async () => {
    const order = createTestOrder();
    await orderRepo.save(order);

    const result = await confirmOrder.execute(order.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.orderId).toBe(order.id);

    const updated = await orderRepo.findById(order.id);
    expect(updated!.status.isConfirmed()).toBe(true);
  });

  it("fails for non-existent order", async () => {
    const result = await confirmOrder.execute("no-order");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("OrderNotFound");
  });

  it("fails for already confirmed order", async () => {
    const order = createTestOrder({ status: "confirmed" });
    await orderRepo.save(order);

    const result = await confirmOrder.execute(order.id);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidOrderTransition");
  });
});
