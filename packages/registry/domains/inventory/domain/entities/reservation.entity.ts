import { Result } from "../../shared/result.js";
import { Quantity } from "../value-objects/quantity.vo.js";
import { WarehouseId } from "../value-objects/warehouse-id.vo.js";
import { ReservationStatus } from "../value-objects/reservation-status.vo.js";
import { ReservationExpired } from "../errors/reservation-expired.error.js";
import { InvalidStockQuantity } from "../errors/invalid-stock-quantity.error.js";
import { InvalidSku } from "../errors/invalid-sku.error.js";
import { InvalidReservationReference } from "../errors/invalid-reservation-reference.error.js";
import { InvalidReservationExpiry } from "../errors/invalid-reservation-expiry.error.js";
import { InvalidReservationState } from "../errors/invalid-reservation-state.error.js";
import type { InvalidWarehouseId } from "../errors/invalid-warehouse-id.error.js";
import type { InvalidReservationStatus } from "../errors/invalid-reservation-status.error.js";

export class Reservation {
  readonly id: string;
  readonly sku: string;
  readonly warehouseId: WarehouseId;
  readonly quantity: Quantity;
  readonly status: ReservationStatus;
  readonly referenceId: string;
  readonly referenceType: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    sku: string,
    warehouseId: WarehouseId,
    quantity: Quantity,
    status: ReservationStatus,
    referenceId: string,
    referenceType: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.status = status;
    this.referenceId = referenceId;
    this.referenceType = referenceType;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isExpired(now: Date): boolean {
    return now > this.expiresAt;
  }

  static create(params: {
    id: string;
    sku: string;
    warehouseId: string;
    quantity: number;
    referenceId: string;
    referenceType: string;
    expiresAt: Date;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<
    Reservation,
    | InvalidSku
    | InvalidReservationReference
    | InvalidWarehouseId
    | InvalidStockQuantity
    | InvalidReservationStatus
    | InvalidReservationExpiry
  > {
    if (!params.sku || typeof params.sku !== "string" || params.sku.trim().length === 0) {
      return Result.fail(InvalidSku.create());
    }

    if (!params.referenceId || typeof params.referenceId !== "string" || params.referenceId.trim().length === 0) {
      return Result.fail(InvalidReservationReference.create("Reference ID cannot be empty"));
    }

    if (!params.referenceType || typeof params.referenceType !== "string" || params.referenceType.trim().length === 0) {
      return Result.fail(InvalidReservationReference.create("Reference type cannot be empty"));
    }

    const warehouseIdResult = WarehouseId.create(params.warehouseId);
    if (warehouseIdResult.isFail()) {
      return Result.fail(warehouseIdResult.unwrapError());
    }

    if (params.quantity <= 0) {
      return Result.fail(InvalidStockQuantity.create("Reservation quantity must be greater than zero"));
    }

    const quantityResult = Quantity.create(params.quantity);
    if (quantityResult.isFail()) {
      return Result.fail(quantityResult.unwrapError());
    }

    let status: ReservationStatus;
    if (params.status) {
      const statusResult = ReservationStatus.from(params.status);
      if (statusResult.isFail()) {
        return Result.fail(statusResult.unwrapError());
      }
      status = statusResult.unwrap();
    } else {
      status = ReservationStatus.pending();
    }

    // Only validate future expiresAt for genuinely new reservations
    const isReconstitution = params.status !== undefined || params.createdAt !== undefined;
    if (!isReconstitution && params.expiresAt <= new Date()) {
      return Result.fail(InvalidReservationExpiry.create());
    }

    const now = new Date();
    return Result.ok(
      new Reservation(
        params.id,
        params.sku.trim(),
        warehouseIdResult.unwrap(),
        quantityResult.unwrap(),
        status,
        params.referenceId.trim(),
        params.referenceType.trim(),
        params.expiresAt,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  confirm(now: Date): Result<Reservation, InvalidReservationState | ReservationExpired> {
    if (this.status.isConfirmed()) {
      return Result.ok(this);
    }

    if (!this.status.isPending()) {
      return Result.fail(InvalidReservationState.create("confirm", this.status.value));
    }

    if (this.isExpired(now)) {
      return Result.fail(ReservationExpired.create(this.id));
    }

    return Result.ok(
      new Reservation(
        this.id,
        this.sku,
        this.warehouseId,
        this.quantity,
        ReservationStatus.confirmed(),
        this.referenceId,
        this.referenceType,
        this.expiresAt,
        this.createdAt,
        now,
      ),
    );
  }

  release(now: Date): Result<Reservation, InvalidReservationState> {
    if (this.status.isReleased()) {
      return Result.ok(this);
    }

    if (!this.status.isPending()) {
      return Result.fail(InvalidReservationState.create("release", this.status.value));
    }

    return Result.ok(
      new Reservation(
        this.id,
        this.sku,
        this.warehouseId,
        this.quantity,
        ReservationStatus.released(),
        this.referenceId,
        this.referenceType,
        this.expiresAt,
        this.createdAt,
        now,
      ),
    );
  }

  expire(): Result<Reservation, InvalidReservationState> {
    if (this.status.isExpired()) {
      return Result.ok(this);
    }

    if (!this.status.isPending()) {
      return Result.fail(InvalidReservationState.create("expire", this.status.value));
    }

    return Result.ok(
      new Reservation(
        this.id,
        this.sku,
        this.warehouseId,
        this.quantity,
        ReservationStatus.expired(),
        this.referenceId,
        this.referenceType,
        this.expiresAt,
        this.createdAt,
        new Date(),
      ),
    );
  }
}
