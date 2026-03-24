import { describe, it, expect } from "vitest";
import { Reservation } from "../entities/reservation.entity.js";

describe("Reservation Entity", () => {
  const futureDate = new Date(Date.now() + 30 * 60 * 1000);
  const pastDate = new Date(Date.now() - 30 * 60 * 1000);
  const validParams = {
    id: "res-1",
    sku: "SKU-001",
    warehouseId: "warehouse-main",
    quantity: 5,
    referenceId: "order-1",
    referenceType: "order",
    expiresAt: futureDate,
  };

  describe("create", () => {
    it("creates with valid params and defaults to pending", () => {
      const result = Reservation.create(validParams);
      expect(result.isOk()).toBe(true);
      const res = result.unwrap();
      expect(res.id).toBe("res-1");
      expect(res.sku).toBe("SKU-001");
      expect(res.warehouseId.value).toBe("warehouse-main");
      expect(res.quantity.value).toBe(5);
      expect(res.status.isPending()).toBe(true);
      expect(res.referenceId).toBe("order-1");
      expect(res.referenceType).toBe("order");
    });

    it("rejects zero quantity", () => {
      const result = Reservation.create({ ...validParams, quantity: 0 });
      expect(result.isFail()).toBe(true);
    });

    it("rejects negative quantity", () => {
      const result = Reservation.create({ ...validParams, quantity: -1 });
      expect(result.isFail()).toBe(true);
    });

    it("rejects past expiresAt for new reservations", () => {
      const result = Reservation.create({ ...validParams, expiresAt: pastDate });
      expect(result.isFail()).toBe(true);
    });

    it("allows past expiresAt when reconstituting (status provided)", () => {
      const result = Reservation.create({
        ...validParams,
        expiresAt: pastDate,
        status: "pending",
      });
      expect(result.isOk()).toBe(true);
    });

    it("allows past expiresAt when reconstituting (createdAt provided)", () => {
      const result = Reservation.create({
        ...validParams,
        expiresAt: pastDate,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      });
      expect(result.isOk()).toBe(true);
    });

    it("rejects empty referenceId", () => {
      const result = Reservation.create({ ...validParams, referenceId: "" });
      expect(result.isFail()).toBe(true);
    });

    it("rejects empty SKU", () => {
      const result = Reservation.create({ ...validParams, sku: "" });
      expect(result.isFail()).toBe(true);
    });

    it("validates warehouseId via WarehouseId VO", () => {
      const result = Reservation.create({ ...validParams, warehouseId: "" });
      expect(result.isFail()).toBe(true);
    });

    it("rejects empty referenceType", () => {
      const result = Reservation.create({ ...validParams, referenceType: "" });
      expect(result.isFail()).toBe(true);
    });
  });

  describe("isExpired", () => {
    it("returns true when now is past expiresAt", () => {
      const res = Reservation.create(validParams).unwrap();
      const farFuture = new Date(Date.now() + 60 * 60 * 1000);
      expect(res.isExpired(farFuture)).toBe(true);
    });

    it("returns false when now is before expiresAt", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date(Date.now() - 1000);
      expect(res.isExpired(now)).toBe(false);
    });
  });

  describe("confirm", () => {
    it("succeeds on pending non-expired", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const result = res.confirm(now);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isConfirmed()).toBe(true);
    });

    it("fails on expired reservation", () => {
      const res = Reservation.create(validParams).unwrap();
      const farFuture = new Date(Date.now() + 60 * 60 * 1000);
      const result = res.confirm(farFuture);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().name).toBe("ReservationExpired");
    });

    it("fails on released reservation", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const released = res.release(now).unwrap();
      const result = released.confirm(now);
      expect(result.isFail()).toBe(true);
    });

    it("is idempotent on already confirmed", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const confirmed = res.confirm(now).unwrap();
      const result = confirmed.confirm(now);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(confirmed);
    });
  });

  describe("release", () => {
    it("succeeds on pending", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const result = res.release(now);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isReleased()).toBe(true);
    });

    it("succeeds on pending even if expired", () => {
      const res = Reservation.create({
        ...validParams,
        expiresAt: pastDate,
        status: "pending",
      }).unwrap();
      const now = new Date();
      const result = res.release(now);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isReleased()).toBe(true);
    });

    it("fails on confirmed reservation", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const confirmed = res.confirm(now).unwrap();
      const result = confirmed.release(now);
      expect(result.isFail()).toBe(true);
    });

    it("is idempotent on already released", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const released = res.release(now).unwrap();
      const result = released.release(now);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(released);
    });
  });

  describe("expire", () => {
    it("succeeds on pending", () => {
      const res = Reservation.create(validParams).unwrap();
      const result = res.expire();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isExpired()).toBe(true);
    });

    it("fails on confirmed", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const confirmed = res.confirm(now).unwrap();
      const result = confirmed.expire();
      expect(result.isFail()).toBe(true);
    });

    it("fails on released", () => {
      const res = Reservation.create(validParams).unwrap();
      const now = new Date();
      const released = res.release(now).unwrap();
      const result = released.expire();
      expect(result.isFail()).toBe(true);
    });

    it("is idempotent on already expired", () => {
      const res = Reservation.create(validParams).unwrap();
      const expired = res.expire().unwrap();
      const result = expired.expire();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(expired);
    });
  });

  describe("immutability", () => {
    it("original reservation unchanged after mutations", () => {
      const original = Reservation.create(validParams).unwrap();
      const now = new Date();
      original.confirm(now);
      original.release(now);
      expect(original.status.isPending()).toBe(true);
    });
  });
});
