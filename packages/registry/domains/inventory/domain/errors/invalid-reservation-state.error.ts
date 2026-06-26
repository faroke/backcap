export class InvalidReservationState extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReservationState";
  }

  static create(action: string, state: string): InvalidReservationState {
    return new InvalidReservationState(`Cannot ${action} reservation in "${state}" state`);
  }
}
