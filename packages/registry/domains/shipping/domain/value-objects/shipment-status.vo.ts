import { Result } from "../../shared/result.js";
import { InvalidShipmentStatus } from "../errors/invalid-shipment-status.error.js";

export type ShipmentStatusValue =
  | "created"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "canceled";

const VALID_TRANSITIONS: Record<ShipmentStatusValue, readonly ShipmentStatusValue[]> = {
  created: ["dispatched", "canceled"],
  dispatched: ["in_transit", "canceled"],
  in_transit: ["delivered"],
  delivered: [],
  canceled: [],
};

export class ShipmentStatus {
  readonly value: ShipmentStatusValue;

  private constructor(value: ShipmentStatusValue) {
    this.value = value;
  }

  static created(): ShipmentStatus {
    return new ShipmentStatus("created");
  }

  static dispatched(): ShipmentStatus {
    return new ShipmentStatus("dispatched");
  }

  static inTransit(): ShipmentStatus {
    return new ShipmentStatus("in_transit");
  }

  static delivered(): ShipmentStatus {
    return new ShipmentStatus("delivered");
  }

  static canceled(): ShipmentStatus {
    return new ShipmentStatus("canceled");
  }

  static from(value: string): Result<ShipmentStatus, InvalidShipmentStatus> {
    if (
      value === "created" ||
      value === "dispatched" ||
      value === "in_transit" ||
      value === "delivered" ||
      value === "canceled"
    ) {
      return Result.ok(new ShipmentStatus(value));
    }
    return Result.fail(InvalidShipmentStatus.create(value));
  }

  canTransitionTo(target: ShipmentStatusValue): boolean {
    return VALID_TRANSITIONS[this.value].includes(target);
  }

  isCreated(): boolean {
    return this.value === "created";
  }

  isDispatched(): boolean {
    return this.value === "dispatched";
  }

  isInTransit(): boolean {
    return this.value === "in_transit";
  }

  isDelivered(): boolean {
    return this.value === "delivered";
  }

  isCanceled(): boolean {
    return this.value === "canceled";
  }

  equals(other: ShipmentStatus): boolean {
    return this.value === other.value;
  }
}
