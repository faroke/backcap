import { describe, it, expect, beforeEach } from "vitest";
import { ListOrders } from "../use-cases/list-orders.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";
import { createTestOrder } from "./fixtures/order.fixture.js";

describe("ListOrders use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let listOrders: ListOrders;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    listOrders = new ListOrders(orderRepo);
  });

  it("returns empty list when no orders", async () => {
    const result = await listOrders.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual([]);
  });

  it("returns all orders", async () => {
    await orderRepo.save(createTestOrder({ id: "order-1" }));
    await orderRepo.save(createTestOrder({ id: "order-2" }));

    const result = await listOrders.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });
});
