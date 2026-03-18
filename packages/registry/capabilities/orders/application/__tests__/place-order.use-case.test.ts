import { describe, it, expect, beforeEach } from "vitest";
import { PlaceOrder } from "../use-cases/place-order.use-case.js";
import { InMemoryOrderRepository } from "./mocks/order-repository.mock.js";

describe("PlaceOrder use case", () => {
  let orderRepo: InMemoryOrderRepository;
  let placeOrder: PlaceOrder;

  const validInput = {
    items: [
      { productId: "prod-1", quantity: 2, unitPriceCents: 1000 },
      { productId: "prod-2", quantity: 1, unitPriceCents: 2500 },
    ],
    shippingAddress: { street: "123 Main St", city: "Paris", country: "France", postalCode: "75001" },
    billingAddress: { street: "456 Billing Ave", city: "Lyon", country: "France", postalCode: "69001" },
  };

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    placeOrder = new PlaceOrder(orderRepo);
  });

  it("places order successfully", async () => {
    const result = await placeOrder.execute(validInput);
    expect(result.isOk()).toBe(true);

    const { orderId, event } = result.unwrap();
    expect(orderId).toBeDefined();
    expect(event.orderId).toBe(orderId);
    expect(event.totalCents).toBe(4500);
    expect(event.itemCount).toBe(2);

    const saved = await orderRepo.findById(orderId);
    expect(saved).not.toBeNull();
    expect(saved!.status.isPending()).toBe(true);
  });

  it("fails with empty items", async () => {
    const result = await placeOrder.execute({ ...validInput, items: [] });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid shipping address", async () => {
    const result = await placeOrder.execute({
      ...validInput,
      shippingAddress: { street: "", city: "Paris", country: "France", postalCode: "75001" },
    });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid item data", async () => {
    const result = await placeOrder.execute({
      ...validInput,
      items: [{ productId: "", quantity: 1, unitPriceCents: 1000 }],
    });
    expect(result.isFail()).toBe(true);
  });
});
