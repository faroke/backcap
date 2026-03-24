export class ReservationNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationNotFound";
  }

  static create(reservationId: string): ReservationNotFound {
    return new ReservationNotFound(
      `Reservation not found: "${reservationId}"`,
    );
  }
}
