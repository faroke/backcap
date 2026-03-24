import { Result } from "../../../shared/result.js";
import { ShipmentStatus } from "../value-objects/shipment-status.vo.js";
import { ShippingZone } from "../value-objects/shipping-zone.vo.js";
import { TrackingNumber } from "../value-objects/tracking-number.vo.js";
import { InvalidShipmentTransition } from "../errors/invalid-shipment-transition.error.js";

export class Shipment {
  readonly id: string;
  readonly orderId: string;
  readonly carrierId: string;
  readonly trackingNumber: TrackingNumber | null;
  readonly status: ShipmentStatus;
  readonly zone: ShippingZone;
  readonly weightGrams: number;
  readonly rateCents: number | null;
  readonly rateCurrency: string | null;
  readonly cancelReason: string | null;
  readonly estimatedDeliveryDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    orderId: string,
    carrierId: string,
    trackingNumber: TrackingNumber | null,
    status: ShipmentStatus,
    zone: ShippingZone,
    weightGrams: number,
    rateCents: number | null,
    rateCurrency: string | null,
    cancelReason: string | null,
    estimatedDeliveryDate: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.orderId = orderId;
    this.carrierId = carrierId;
    this.trackingNumber = trackingNumber;
    this.status = status;
    this.zone = zone;
    this.weightGrams = weightGrams;
    this.rateCents = rateCents;
    this.rateCurrency = rateCurrency;
    this.cancelReason = cancelReason;
    this.estimatedDeliveryDate = estimatedDeliveryDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    orderId: string;
    carrierId: string;
    zone: ShippingZone;
    weightGrams: number;
    trackingNumber?: TrackingNumber;
    status?: string;
    cancelReason?: string;
    rateCents?: number;
    rateCurrency?: string;
    estimatedDeliveryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Shipment, Error> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(new Error("Shipment ID is required"));
    }
    if (!params.orderId || params.orderId.trim().length === 0) {
      return Result.fail(new Error("Order ID is required"));
    }
    if (!params.carrierId || params.carrierId.trim().length === 0) {
      return Result.fail(new Error("Carrier ID is required"));
    }
    if (!Number.isInteger(params.weightGrams) || params.weightGrams <= 0) {
      return Result.fail(new Error("Weight must be a positive integer (grams)"));
    }

    let status: ShipmentStatus;
    if (params.status) {
      const statusResult = ShipmentStatus.from(params.status);
      if (statusResult.isFail()) {
        return Result.fail(statusResult.unwrapError());
      }
      status = statusResult.unwrap();
    } else {
      status = ShipmentStatus.created();
    }

    const now = new Date();
    return Result.ok(
      new Shipment(
        params.id,
        params.orderId,
        params.carrierId,
        params.trackingNumber ?? null,
        status,
        params.zone,
        params.weightGrams,
        params.rateCents ?? null,
        params.rateCurrency ?? null,
        params.cancelReason ?? null,
        params.estimatedDeliveryDate ?? null,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  dispatch(trackingNumber: TrackingNumber): Result<Shipment, Error> {
    if (!this.status.canTransitionTo("dispatched")) {
      return Result.fail(InvalidShipmentTransition.create(this.status.value, "dispatched"));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, trackingNumber,
        ShipmentStatus.dispatched(), this.zone, this.weightGrams,
        this.rateCents, this.rateCurrency, this.cancelReason,
        this.estimatedDeliveryDate, this.createdAt, new Date(),
      ),
    );
  }

  markInTransit(): Result<Shipment, Error> {
    if (!this.status.canTransitionTo("in_transit")) {
      return Result.fail(InvalidShipmentTransition.create(this.status.value, "in_transit"));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, this.trackingNumber,
        ShipmentStatus.inTransit(), this.zone, this.weightGrams,
        this.rateCents, this.rateCurrency, this.cancelReason,
        this.estimatedDeliveryDate, this.createdAt, new Date(),
      ),
    );
  }

  deliver(): Result<Shipment, Error> {
    if (!this.status.canTransitionTo("delivered")) {
      return Result.fail(InvalidShipmentTransition.create(this.status.value, "delivered"));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, this.trackingNumber,
        ShipmentStatus.delivered(), this.zone, this.weightGrams,
        this.rateCents, this.rateCurrency, this.cancelReason,
        this.estimatedDeliveryDate, this.createdAt, new Date(),
      ),
    );
  }

  cancel(reason?: string): Result<Shipment, Error> {
    if (!this.status.canTransitionTo("canceled")) {
      return Result.fail(InvalidShipmentTransition.create(this.status.value, "canceled"));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, this.trackingNumber,
        ShipmentStatus.canceled(), this.zone, this.weightGrams,
        this.rateCents, this.rateCurrency, reason ?? null,
        this.estimatedDeliveryDate, this.createdAt, new Date(),
      ),
    );
  }

  assignRate(rateCents: number, rateCurrency: string): Result<Shipment, Error> {
    if (!Number.isInteger(rateCents) || rateCents < 0) {
      return Result.fail(new Error("Rate cents must be a non-negative integer"));
    }
    if (!/^[A-Z]{3}$/.test(rateCurrency.toUpperCase())) {
      return Result.fail(new Error(`Invalid rate currency: "${rateCurrency}"`));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, this.trackingNumber,
        this.status, this.zone, this.weightGrams,
        rateCents, rateCurrency.toUpperCase(), this.cancelReason,
        this.estimatedDeliveryDate, this.createdAt, new Date(),
      ),
    );
  }

  assignEstimatedDelivery(date: Date, now?: Date): Result<Shipment, Error> {
    const reference = now ?? new Date();
    if (date <= reference) {
      return Result.fail(new Error("Estimated delivery date must be in the future"));
    }
    return Result.ok(
      new Shipment(
        this.id, this.orderId, this.carrierId, this.trackingNumber,
        this.status, this.zone, this.weightGrams,
        this.rateCents, this.rateCurrency, this.cancelReason,
        date, this.createdAt, new Date(),
      ),
    );
  }
}
