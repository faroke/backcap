export class InvalidReservationReference extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReservationReference";
  }

  static create(reason: string): InvalidReservationReference {
    return new InvalidReservationReference(reason);
  }
}
