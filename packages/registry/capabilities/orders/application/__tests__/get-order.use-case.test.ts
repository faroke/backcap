import { describe, it, expect, beforeEach } from "vitest";
import { GetOrder } from "../use-cases/get-order.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";
import { createTestOrder } from "./fixtures/order.fixture.js";

describe("GetOrder use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let getOrder: GetOrder;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    getOrder = new GetOrder(orderRepo);
  });

  it("returns order output", async () => {
    const order = createTestOrder();
    await orderRepo.save(order);

    const result = await getOrder.execute(order.id);
    expect(result.isOk()).toBe(true);

    const output = result.unwrap();
    expect(output.id).toBe(order.id);
    expect(output.status).toBe("pending");
    expect(output.items).toHaveLength(1);
    expect(output.items[0].productId).toBe("prod-1");
    expect(output.shippingAddress.city).toBe("Paris");
    expect(output.billingAddress.city).toBe("Lyon");
    expect(output.totalCents).toBe(2000);
    expect(output.itemCount).toBe(1);
  });

  it("fails for non-existent order", async () => {
    const result = await getOrder.execute("no-order");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("OrderNotFound");
  });
});
