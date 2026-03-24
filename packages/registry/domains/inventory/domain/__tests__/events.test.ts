import { describe, it, expect } from "vitest";
import { StockInitialized } from "../events/stock-initialized.event.js";
import { StockAdjusted } from "../events/stock-adjusted.event.js";
import { StockReserved } from "../events/stock-reserved.event.js";
import { ReservationReleased } from "../events/reservation-released.event.js";
import { ReservationConfirmed } from "../events/reservation-confirmed.event.js";
import { LowStockAlert } from "../events/low-stock-alert.event.js";
import { StockRestocked } from "../events/stock-restocked.event.js";

describe("Domain Events", () => {
  describe("StockInitialized", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new StockInitialized("SKU-001", "wh-1", 100, date);
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.quantity).toBe(100);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt to current time", () => {
      const before = new Date();
      const event = new StockInitialized("SKU-001", "wh-1", 100);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("StockAdjusted", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new StockAdjusted("SKU-001", "wh-1", 100, 50, "correction", date);
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.previousQuantity).toBe(100);
      expect(event.newQuantity).toBe(50);
      expect(event.reason).toBe("correction");
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new StockAdjusted("SKU-001", "wh-1", 100, 50, "correction");
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("StockReserved", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new StockReserved("res-1", "SKU-001", "wh-1", 10, date);
      expect(event.reservationId).toBe("res-1");
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.quantity).toBe(10);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new StockReserved("res-1", "SKU-001", "wh-1", 10);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("ReservationReleased", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new ReservationReleased("res-1", "SKU-001", "wh-1", 10, date);
      expect(event.reservationId).toBe("res-1");
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.quantity).toBe(10);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new ReservationReleased("res-1", "SKU-001", "wh-1", 10);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("ReservationConfirmed", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new ReservationConfirmed("res-1", "SKU-001", "wh-1", 10, date);
      expect(event.reservationId).toBe("res-1");
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.quantity).toBe(10);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new ReservationConfirmed("res-1", "SKU-001", "wh-1", 10);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("LowStockAlert", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new LowStockAlert("SKU-001", "wh-1", 5, 10, date);
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.available).toBe(5);
      expect(event.threshold).toBe(10);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new LowStockAlert("SKU-001", "wh-1", 5, 10);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("StockRestocked", () => {
    it("assigns all fields correctly", () => {
      const date = new Date("2026-01-01");
      const event = new StockRestocked("SKU-001", "wh-1", 30, 80, date);
      expect(event.sku).toBe("SKU-001");
      expect(event.warehouseId).toBe("wh-1");
      expect(event.addedQuantity).toBe(30);
      expect(event.newTotal).toBe(80);
      expect(event.occurredAt).toBe(date);
    });

    it("defaults occurredAt", () => {
      const before = new Date();
      const event = new StockRestocked("SKU-001", "wh-1", 30, 80);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
