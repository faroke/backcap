export class InvalidReservationStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReservationStatus";
  }

  static create(value: string): InvalidReservationStatus {
    return new InvalidReservationStatus(`Invalid reservation status: "${value}"`);
  }
}
