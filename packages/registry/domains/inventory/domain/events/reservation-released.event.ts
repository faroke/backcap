export class ReservationReleased {
  public readonly reservationId: string;
  public readonly sku: string;
  public readonly warehouseId: string;
  public readonly quantity: number;
  public readonly occurredAt: Date;

  constructor(
    reservationId: string,
    sku: string,
    warehouseId: string,
    quantity: number,
    occurredAt: Date = new Date(),
  ) {
    this.reservationId = reservationId;
    this.sku = sku;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.occurredAt = occurredAt;
  }
}
