export class ReservationExpired extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationExpired";
  }

  static create(reservationId: string): ReservationExpired {
    return new ReservationExpired(
      `Reservation has expired: "${reservationId}"`,
    );
  }
}
