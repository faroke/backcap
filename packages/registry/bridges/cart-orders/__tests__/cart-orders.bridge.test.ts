import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../cart-orders.bridge.js";

describe("cart-orders bridge", () => {
  const cartItems = [
    { id: "ci-1", productId: "prod-1", variantId: "var-1", quantity: 2, unitPriceCents: 2999, currency: "USD", lineTotal: 5998 },
    { id: "ci-2", productId: "prod-2", variantId: "var-3", quantity: 1, unitPriceCents: 4999, currency: "USD", lineTotal: 4999 },
  ];

  const cart = {
    id: "cart-1",
    userId: "user-1",
    status: "converted",
    items: cartItems,
    totalCents: 10997,
    itemCount: 3,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const defaultAddress = { street: "123 Main St", city: "Paris", country: "FR", postalCode: "75001" };

  function mockGetCart(result: typeof cart | null) {
    return {
      execute: vi.fn().mockResolvedValue(
        result
          ? { isOk: () => true, isFail: () => false, unwrap: () => result }
          : { isOk: () => false, isFail: () => true, unwrap: () => { throw new Error("not found"); } },
      ),
    };
  }

  function mockPlaceOrder(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? { isOk: () => true, isFail: () => false, unwrap: () => ({ orderId: "ord-1" }) }
          : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("placement failed") },
      ),
    };
  }

  it("converts cart items to an order on CartConverted", async () => {
    const bus = new InMemoryEventBus();
    const getCart = mockGetCart(cart);
    const placeOrder = mockPlaceOrder();
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });

    bridge.wire(bus);

    await bus.publish("CartConverted", { cartId: "cart-1", occurredAt: new Date() });

    expect(getCart.execute).toHaveBeenCalledWith("cart-1");
    expect(placeOrder.execute).toHaveBeenCalledOnce();
    expect(placeOrder.execute).toHaveBeenCalledWith({
      items: [
        { productId: "prod-1", quantity: 2, unitPriceCents: 2999 },
        { productId: "prod-2", quantity: 1, unitPriceCents: 4999 },
      ],
      shippingAddress: defaultAddress,
      billingAddress: defaultAddress,
    });
  });

  it("publishes OrderPlaced event after successful order placement", async () => {
    const bus = new InMemoryEventBus();
    const getCart = mockGetCart(cart);
    const placeOrder = mockPlaceOrder();
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });
    const orderPlacedHandler = vi.fn();

    bridge.wire(bus);
    bus.subscribe("OrderPlaced", orderPlacedHandler);

    await bus.publish("CartConverted", { cartId: "cart-1", occurredAt: new Date() });

    expect(orderPlacedHandler).toHaveBeenCalledOnce();
    expect(orderPlacedHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "ord-1",
        totalCents: 10997,
        itemCount: 2,
        occurredAt: expect.any(Date),
      }),
    );
  });

  it("does not publish OrderPlaced when placeOrder fails", async () => {
    const bus = new InMemoryEventBus();
    const getCart = mockGetCart(cart);
    const placeOrder = mockPlaceOrder(false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });
    const orderPlacedHandler = vi.fn();

    bridge.wire(bus);
    bus.subscribe("OrderPlaced", orderPlacedHandler);

    await bus.publish("CartConverted", { cartId: "cart-1", occurredAt: new Date() });

    expect(orderPlacedHandler).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("skips order placement when cart is not found", async () => {
    const bus = new InMemoryEventBus();
    const getCart = mockGetCart(null);
    const placeOrder = mockPlaceOrder();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });

    bridge.wire(bus);

    await bus.publish("CartConverted", { cartId: "cart-unknown", occurredAt: new Date() });

    expect(placeOrder.execute).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("skips order placement when cart is empty", async () => {
    const bus = new InMemoryEventBus();
    const emptyCart = { ...cart, items: [], itemCount: 0, totalCents: 0 };
    const getCart = mockGetCart(emptyCart);
    const placeOrder = mockPlaceOrder();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });

    bridge.wire(bus);

    await bus.publish("CartConverted", { cartId: "cart-1", occurredAt: new Date() });

    expect(placeOrder.execute).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles thrown exception gracefully without re-throwing", async () => {
    const bus = new InMemoryEventBus();
    const getCart = { execute: vi.fn().mockRejectedValue(new Error("db down")) };
    const placeOrder = mockPlaceOrder();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getCart, placeOrder, defaultAddress });

    bridge.wire(bus);

    await expect(
      bus.publish("CartConverted", { cartId: "cart-1", occurredAt: new Date() }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
