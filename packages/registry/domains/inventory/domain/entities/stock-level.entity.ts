import { Result } from "../../shared/result.js";
import { Quantity } from "../value-objects/quantity.vo.js";
import { WarehouseId } from "../value-objects/warehouse-id.vo.js";
import { InsufficientStock } from "../errors/insufficient-stock.error.js";
import { InvalidStockQuantity } from "../errors/invalid-stock-quantity.error.js";

export class StockLevel {
  readonly id: string;
  readonly sku: string;
  readonly warehouseId: WarehouseId;
  readonly total: Quantity;
  readonly reserved: Quantity;
  readonly available: Quantity;
  readonly lowStockThreshold: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    sku: string,
    warehouseId: WarehouseId,
    total: Quantity,
    reserved: Quantity,
    lowStockThreshold: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.total = total;
    this.reserved = reserved;
    this.available = Quantity.unsafeFrom(total.value - reserved.value);
    this.lowStockThreshold = lowStockThreshold;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get isLowStock(): boolean {
    return this.available.isAtOrBelow(this.lowStockThreshold);
  }

  static create(params: {
    id: string;
    sku: string;
    warehouseId: string;
    totalQuantity: number;
    reservedQuantity?: number;
    lowStockThreshold?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<StockLevel, Error> {
    if (!params.sku || typeof params.sku !== "string" || params.sku.trim().length === 0) {
      return Result.fail(new Error("SKU cannot be empty"));
    }

    const warehouseIdResult = WarehouseId.create(params.warehouseId);
    if (warehouseIdResult.isFail()) {
      return Result.fail(warehouseIdResult.unwrapError());
    }

    const totalResult = Quantity.create(params.totalQuantity);
    if (totalResult.isFail()) {
      return Result.fail(totalResult.unwrapError());
    }

    const reservedQuantity = params.reservedQuantity ?? 0;
    const reservedResult = Quantity.create(reservedQuantity);
    if (reservedResult.isFail()) {
      return Result.fail(reservedResult.unwrapError());
    }

    const total = totalResult.unwrap();
    const reserved = reservedResult.unwrap();

    if (reserved.value > total.value) {
      return Result.fail(
        InvalidStockQuantity.create("Reserved quantity cannot exceed total quantity"),
      );
    }

    const threshold = params.lowStockThreshold ?? 0;
    if (threshold < 0) {
      return Result.fail(
        InvalidStockQuantity.create("Low stock threshold cannot be negative"),
      );
    }

    const now = new Date();
    return Result.ok(
      new StockLevel(
        params.id,
        params.sku.trim(),
        warehouseIdResult.unwrap(),
        total,
        reserved,
        threshold,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  adjustTotal(newTotal: number, reason: string): Result<StockLevel, Error> {
    const newTotalResult = Quantity.create(newTotal);
    if (newTotalResult.isFail()) {
      return Result.fail(newTotalResult.unwrapError());
    }

    const newTotalQty = newTotalResult.unwrap();
    if (newTotalQty.value < this.reserved.value) {
      return Result.fail(
        InvalidStockQuantity.create(
          `New total (${newTotal}) cannot be less than reserved (${this.reserved.value})`,
        ),
      );
    }

    return Result.ok(
      new StockLevel(
        this.id,
        this.sku,
        this.warehouseId,
        newTotalQty,
        this.reserved,
        this.lowStockThreshold,
        this.createdAt,
        new Date(),
      ),
    );
  }

  reserve(quantity: number): Result<StockLevel, InsufficientStock | Error> {
    const qtyResult = Quantity.create(quantity);
    if (qtyResult.isFail()) {
      return Result.fail(qtyResult.unwrapError());
    }

    const qty = qtyResult.unwrap();
    if (qty.value > this.available.value) {
      return Result.fail(
        InsufficientStock.create(this.sku, quantity, this.available.value),
      );
    }

    return Result.ok(
      new StockLevel(
        this.id,
        this.sku,
        this.warehouseId,
        this.total,
        this.reserved.add(qty),
        this.lowStockThreshold,
        this.createdAt,
        new Date(),
      ),
    );
  }

  releaseReserved(quantity: number): Result<StockLevel, Error> {
    const qtyResult = Quantity.create(quantity);
    if (qtyResult.isFail()) {
      return Result.fail(qtyResult.unwrapError());
    }

    const qty = qtyResult.unwrap();
    if (qty.value > this.reserved.value) {
      return Result.fail(
        InvalidStockQuantity.create(
          `Cannot release ${quantity} units: only ${this.reserved.value} reserved`,
        ),
      );
    }

    const newReservedResult = this.reserved.subtract(qty);
    if (newReservedResult.isFail()) {
      return Result.fail(newReservedResult.unwrapError());
    }

    return Result.ok(
      new StockLevel(
        this.id,
        this.sku,
        this.warehouseId,
        this.total,
        newReservedResult.unwrap(),
        this.lowStockThreshold,
        this.createdAt,
        new Date(),
      ),
    );
  }

  confirmReserved(quantity: number): Result<StockLevel, Error> {
    const qtyResult = Quantity.create(quantity);
    if (qtyResult.isFail()) {
      return Result.fail(qtyResult.unwrapError());
    }

    const qty = qtyResult.unwrap();
    if (qty.value > this.reserved.value) {
      return Result.fail(
        InvalidStockQuantity.create(
          `Cannot confirm ${quantity} units: only ${this.reserved.value} reserved`,
        ),
      );
    }

    const newTotalResult = this.total.subtract(qty);
    if (newTotalResult.isFail()) {
      return Result.fail(newTotalResult.unwrapError());
    }

    const newReservedResult = this.reserved.subtract(qty);
    if (newReservedResult.isFail()) {
      return Result.fail(newReservedResult.unwrapError());
    }

    return Result.ok(
      new StockLevel(
        this.id,
        this.sku,
        this.warehouseId,
        newTotalResult.unwrap(),
        newReservedResult.unwrap(),
        this.lowStockThreshold,
        this.createdAt,
        new Date(),
      ),
    );
  }

  restock(quantity: number): Result<StockLevel, Error> {
    if (quantity <= 0) {
      return Result.fail(
        InvalidStockQuantity.create("Restock quantity must be greater than zero"),
      );
    }

    const qtyResult = Quantity.create(quantity);
    if (qtyResult.isFail()) {
      return Result.fail(qtyResult.unwrapError());
    }

    return Result.ok(
      new StockLevel(
        this.id,
        this.sku,
        this.warehouseId,
        this.total.add(qtyResult.unwrap()),
        this.reserved,
        this.lowStockThreshold,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
