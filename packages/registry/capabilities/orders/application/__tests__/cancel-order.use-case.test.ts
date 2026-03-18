import { describe, it, expect, beforeEach } from "vitest";
import { CancelOrder } from "../use-cases/cancel-order.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";
import { createTestOrder } from "./fixtures/order.fixture.js";

describe("CancelOrder use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let cancelOrder: CancelOrder;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    cancelOrder = new CancelOrder(orderRepo);
  });

  it("cancels a pending order", async () => {
    const order = createTestOrder();
    await orderRepo.save(order);

    const result = await cancelOrder.execute(order.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.orderId).toBe(order.id);

    const updated = await orderRepo.findById(order.id);
    expect(updated!.status.isCanceled()).toBe(true);
  });

  it("cancels a confirmed order", async () => {
    const order = createTestOrder({ status: "confirmed" });
    await orderRepo.save(order);

    const result = await cancelOrder.execute(order.id);
    expect(result.isOk()).toBe(true);
  });

  it("fails for non-existent order", async () => {
    const result = await cancelOrder.execute("no-order");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("OrderNotFound");
  });

  it("fails for already canceled order", async () => {
    const order = createTestOrder({ status: "canceled" });
    await orderRepo.save(order);

    const result = await cancelOrder.execute(order.id);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("OrderAlreadyCanceled");
  });

  it("fails for shipped order", async () => {
    const order = createTestOrder({ status: "shipped" });
    await orderRepo.save(order);

    const result = await cancelOrder.execute(order.id);
    expect(result.isFail()).toBe(true);
  });
});
