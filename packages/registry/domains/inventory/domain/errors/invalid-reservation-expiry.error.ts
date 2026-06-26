export class InvalidReservationExpiry extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReservationExpiry";
  }

  static create(): InvalidReservationExpiry {
    return new InvalidReservationExpiry("Expiration date must be in the future");
  }
}
