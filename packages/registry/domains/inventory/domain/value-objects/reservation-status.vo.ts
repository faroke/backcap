import { Result } from "../../shared/result.js";

export type ReservationStatusValue = "pending" | "confirmed" | "released" | "expired";

export class ReservationStatus {
  readonly value: ReservationStatusValue;

  private constructor(value: ReservationStatusValue) {
    this.value = value;
  }

  static pending(): ReservationStatus {
    return new ReservationStatus("pending");
  }

  static confirmed(): ReservationStatus {
    return new ReservationStatus("confirmed");
  }

  static released(): ReservationStatus {
    return new ReservationStatus("released");
  }

  static expired(): ReservationStatus {
    return new ReservationStatus("expired");
  }

  static from(value: string): Result<ReservationStatus, Error> {
    if (value === "pending" || value === "confirmed" || value === "released" || value === "expired") {
      return Result.ok(new ReservationStatus(value));
    }
    return Result.fail(new Error(`Invalid reservation status: "${value}"`));
  }

  isPending(): boolean {
    return this.value === "pending";
  }

  isConfirmed(): boolean {
    return this.value === "confirmed";
  }

  isReleased(): boolean {
    return this.value === "released";
  }

  isExpired(): boolean {
    return this.value === "expired";
  }

  equals(other: ReservationStatus): boolean {
    return this.value === other.value;
  }
}
