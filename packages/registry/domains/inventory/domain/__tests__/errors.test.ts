import { describe, it, expect } from "vitest";
import { InsufficientStock } from "../errors/insufficient-stock.error.js";
import { StockNotFound } from "../errors/stock-not-found.error.js";
import { ReservationNotFound } from "../errors/reservation-not-found.error.js";
import { ReservationExpired } from "../errors/reservation-expired.error.js";
import { InvalidStockQuantity } from "../errors/invalid-stock-quantity.error.js";

describe("Domain Errors", () => {
  describe("InsufficientStock", () => {
    it("creates with correct message", () => {
      const error = InsufficientStock.create("SKU-001", 10, 5);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InsufficientStock);
      expect(error.name).toBe("InsufficientStock");
      expect(error.message).toContain("SKU-001");
      expect(error.message).toContain("10");
      expect(error.message).toContain("5");
    });
  });

  describe("StockNotFound", () => {
    it("creates with correct message", () => {
      const error = StockNotFound.create("SKU-001", "wh-1");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(StockNotFound);
      expect(error.name).toBe("StockNotFound");
      expect(error.message).toContain("SKU-001");
      expect(error.message).toContain("wh-1");
    });
  });

  describe("ReservationNotFound", () => {
    it("creates with correct message", () => {
      const error = ReservationNotFound.create("res-123");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ReservationNotFound);
      expect(error.name).toBe("ReservationNotFound");
      expect(error.message).toContain("res-123");
    });
  });

  describe("ReservationExpired", () => {
    it("creates with correct message", () => {
      const error = ReservationExpired.create("res-123");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ReservationExpired);
      expect(error.name).toBe("ReservationExpired");
      expect(error.message).toContain("res-123");
    });
  });

  describe("InvalidStockQuantity", () => {
    it("creates with correct message", () => {
      const error = InvalidStockQuantity.create("negative value");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InvalidStockQuantity);
      expect(error.name).toBe("InvalidStockQuantity");
      expect(error.message).toContain("negative value");
    });
  });
});
