import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../orders-billing.bridge.js";

describe("orders-billing bridge", () => {
  function mockProcessPayment(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? {
              isOk: () => true,
              isFail: () => false,
              unwrap: () => ({
                transactionId: "txn-1",
                event: { customerId: "cust-1", amount: 5998, currency: "USD", occurredAt: new Date() },
              }),
            }
          : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("payment declined") },
      ),
    };
  }

  function mockConfirmOrder(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? { isOk: () => true, isFail: () => false }
          : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("confirm failed") },
      ),
    };
  }

  const defaultDeps = {
    processPayment: mockProcessPayment(),
    confirmOrder: mockConfirmOrder(),
    resolveCustomerId: vi.fn().mockResolvedValue("cust-1"),
    resolveOrderId: vi.fn().mockResolvedValue("ord-1"),
  };

  describe("OrderPlaced → ProcessPayment → ConfirmOrder", () => {
    it("triggers payment processing and confirms order on OrderPlaced", async () => {
      const bus = new InMemoryEventBus();
      const processPayment = mockProcessPayment();
      const confirmOrder = mockConfirmOrder();
      const deps = { ...defaultDeps, processPayment, confirmOrder };
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("OrderPlaced", {
        orderId: "ord-1",
        totalCents: 5998,
        itemCount: 2,
        occurredAt: new Date(),
      });

      expect(deps.resolveCustomerId).toHaveBeenCalledWith("ord-1");
      expect(processPayment.execute).toHaveBeenCalledWith({
        customerId: "cust-1",
        amount: 5998,
        currency: "USD",
        description: "Payment for order ord-1",
      });
      expect(confirmOrder.execute).toHaveBeenCalledWith("ord-1");
    });

    it("uses custom currency when provided", async () => {
      const bus = new InMemoryEventBus();
      const processPayment = mockProcessPayment();
      const deps = { ...defaultDeps, processPayment, currency: "EUR" };
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("OrderPlaced", {
        orderId: "ord-1",
        totalCents: 5998,
        itemCount: 2,
        occurredAt: new Date(),
      });

      expect(processPayment.execute).toHaveBeenCalledWith(
        expect.objectContaining({ currency: "EUR" }),
      );
    });

    it("skips payment when customerId cannot be resolved", async () => {
      const bus = new InMemoryEventBus();
      const processPayment = mockProcessPayment();
      const deps = {
        ...defaultDeps,
        processPayment,
        resolveCustomerId: vi.fn().mockResolvedValue(null),
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("OrderPlaced", {
        orderId: "ord-1",
        totalCents: 5998,
        itemCount: 2,
        occurredAt: new Date(),
      });

      expect(processPayment.execute).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("does not confirm order when processPayment fails", async () => {
      const bus = new InMemoryEventBus();
      const confirmOrder = mockConfirmOrder();
      const deps = { ...defaultDeps, processPayment: mockProcessPayment(false), confirmOrder };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("OrderPlaced", {
        orderId: "ord-1",
        totalCents: 5998,
        itemCount: 2,
        occurredAt: new Date(),
      });

      expect(confirmOrder.execute).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("logs error when confirmOrder fails after successful payment", async () => {
      const bus = new InMemoryEventBus();
      const deps = { ...defaultDeps, processPayment: mockProcessPayment(), confirmOrder: mockConfirmOrder(false) };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("OrderPlaced", {
        orderId: "ord-1",
        totalCents: 5998,
        itemCount: 2,
        occurredAt: new Date(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("ConfirmOrder failed after payment"),
        expect.anything(),
        expect.anything(),
      );
      consoleSpy.mockRestore();
    });

    it("handles thrown exception gracefully", async () => {
      const bus = new InMemoryEventBus();
      const deps = {
        ...defaultDeps,
        processPayment: { execute: vi.fn().mockRejectedValue(new Error("network error")) },
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await expect(
        bus.publish("OrderPlaced", { orderId: "ord-1", totalCents: 5998, itemCount: 2, occurredAt: new Date() }),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("PaymentSucceeded → ConfirmOrder (external/webhook fallback)", () => {
    it("confirms order on PaymentSucceeded", async () => {
      const bus = new InMemoryEventBus();
      const confirmOrder = mockConfirmOrder();
      const deps = { ...defaultDeps, confirmOrder };
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("PaymentSucceeded", {
        customerId: "cust-1",
        amount: 5998,
        currency: "USD",
        occurredAt: new Date(),
      });

      expect(deps.resolveOrderId).toHaveBeenCalledWith("cust-1");
      expect(confirmOrder.execute).toHaveBeenCalledWith("ord-1");
    });

    it("logs warning when orderId cannot be resolved", async () => {
      const bus = new InMemoryEventBus();
      const confirmOrder = mockConfirmOrder();
      const deps = {
        ...defaultDeps,
        confirmOrder,
        resolveOrderId: vi.fn().mockResolvedValue(null),
      };
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("PaymentSucceeded", {
        customerId: "cust-1",
        amount: 5998,
        currency: "USD",
        occurredAt: new Date(),
      });

      expect(confirmOrder.execute).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("no pending order found"),
        expect.anything(),
      );
      consoleSpy.mockRestore();
    });

    it("logs error when confirmOrder fails", async () => {
      const bus = new InMemoryEventBus();
      const deps = { ...defaultDeps, confirmOrder: mockConfirmOrder(false) };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge(deps);

      bridge.wire(bus);

      await bus.publish("PaymentSucceeded", {
        customerId: "cust-1",
        amount: 5998,
        currency: "USD",
        occurredAt: new Date(),
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("PaymentFailed → retry event", () => {
    it("publishes PaymentRetryRequested on PaymentFailed", async () => {
      const bus = new InMemoryEventBus();
      const deps = { ...defaultDeps };
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const retryHandler = vi.fn();
      const bridge = createBridge(deps);

      bridge.wire(bus);
      bus.subscribe("PaymentRetryRequested", retryHandler);

      await bus.publish("PaymentFailed", {
        customerId: "cust-1",
        amount: 5998,
        currency: "USD",
        reason: "insufficient funds",
        occurredAt: new Date(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Payment failed for order ord-1"),
      );
      expect(retryHandler).toHaveBeenCalledOnce();
      expect(retryHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "ord-1",
          customerId: "cust-1",
          amount: 5998,
          currency: "USD",
          reason: "insufficient funds",
        }),
      );
      consoleSpy.mockRestore();
    });

    it("logs warning when orderId cannot be resolved on PaymentFailed", async () => {
      const bus = new InMemoryEventBus();
      const deps = {
        ...defaultDeps,
        resolveOrderId: vi.fn().mockResolvedValue(null),
      };
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const retryHandler = vi.fn();
      const bridge = createBridge(deps);

      bridge.wire(bus);
      bus.subscribe("PaymentRetryRequested", retryHandler);

      await bus.publish("PaymentFailed", {
        customerId: "cust-unknown",
        amount: 5998,
        currency: "USD",
        reason: "card expired",
        occurredAt: new Date(),
      });

      expect(retryHandler).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("no pending order found"),
        expect.anything(),
      );
      consoleSpy.mockRestore();
    });
  });
});
