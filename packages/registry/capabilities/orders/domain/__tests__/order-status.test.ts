import { describe, it, expect } from "vitest";
import { OrderStatus } from "../value-objects/order-status.vo.js";

describe("OrderStatus value object", () => {
  it("creates all valid statuses via factory methods", () => {
    expect(OrderStatus.pending().value).toBe("pending");
    expect(OrderStatus.confirmed().value).toBe("confirmed");
    expect(OrderStatus.processing().value).toBe("processing");
    expect(OrderStatus.shipped().value).toBe("shipped");
    expect(OrderStatus.delivered().value).toBe("delivered");
    expect(OrderStatus.canceled().value).toBe("canceled");
    expect(OrderStatus.refunded().value).toBe("refunded");
  });

  it("creates from valid string", () => {
    const result = OrderStatus.from("pending");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("pending");
  });

  it("rejects invalid string", () => {
    const result = OrderStatus.from("invalid");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Invalid order status");
  });

  describe("valid transitions", () => {
    it("pending → confirmed", () => {
      expect(OrderStatus.pending().canTransitionTo("confirmed")).toBe(true);
    });

    it("pending → canceled", () => {
      expect(OrderStatus.pending().canTransitionTo("canceled")).toBe(true);
    });

    it("confirmed → processing", () => {
      expect(OrderStatus.confirmed().canTransitionTo("processing")).toBe(true);
    });

    it("confirmed → canceled", () => {
      expect(OrderStatus.confirmed().canTransitionTo("canceled")).toBe(true);
    });

    it("processing → shipped", () => {
      expect(OrderStatus.processing().canTransitionTo("shipped")).toBe(true);
    });

    it("processing → canceled", () => {
      expect(OrderStatus.processing().canTransitionTo("canceled")).toBe(true);
    });

    it("shipped → delivered", () => {
      expect(OrderStatus.shipped().canTransitionTo("delivered")).toBe(true);
    });

    it("delivered → refunded", () => {
      expect(OrderStatus.delivered().canTransitionTo("refunded")).toBe(true);
    });
  });

  describe("invalid transitions", () => {
    it("pending cannot go to shipped", () => {
      expect(OrderStatus.pending().canTransitionTo("shipped")).toBe(false);
    });

    it("pending cannot go to delivered", () => {
      expect(OrderStatus.pending().canTransitionTo("delivered")).toBe(false);
    });

    it("shipped cannot go to canceled", () => {
      expect(OrderStatus.shipped().canTransitionTo("canceled")).toBe(false);
    });

    it("canceled cannot transition to anything", () => {
      const canceled = OrderStatus.canceled();
      expect(canceled.canTransitionTo("pending")).toBe(false);
      expect(canceled.canTransitionTo("confirmed")).toBe(false);
      expect(canceled.canTransitionTo("shipped")).toBe(false);
    });

    it("refunded cannot transition to anything", () => {
      const refunded = OrderStatus.refunded();
      expect(refunded.canTransitionTo("pending")).toBe(false);
      expect(refunded.canTransitionTo("canceled")).toBe(false);
    });

    it("delivered cannot go to canceled", () => {
      expect(OrderStatus.delivered().canTransitionTo("canceled")).toBe(false);
    });
  });

  describe("predicates", () => {
    it("isPending", () => expect(OrderStatus.pending().isPending()).toBe(true));
    it("isConfirmed", () => expect(OrderStatus.confirmed().isConfirmed()).toBe(true));
    it("isProcessing", () => expect(OrderStatus.processing().isProcessing()).toBe(true));
    it("isShipped", () => expect(OrderStatus.shipped().isShipped()).toBe(true));
    it("isDelivered", () => expect(OrderStatus.delivered().isDelivered()).toBe(true));
    it("isCanceled", () => expect(OrderStatus.canceled().isCanceled()).toBe(true));
    it("isRefunded", () => expect(OrderStatus.refunded().isRefunded()).toBe(true));
  });

  describe("equals", () => {
    it("equal statuses", () => {
      expect(OrderStatus.pending().equals(OrderStatus.pending())).toBe(true);
    });

    it("different statuses", () => {
      expect(OrderStatus.pending().equals(OrderStatus.confirmed())).toBe(false);
    });
  });
});
