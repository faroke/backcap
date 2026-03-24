export class InvalidRating extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRating";
  }

  static create(value: number): InvalidRating {
    return new InvalidRating(
      `Invalid rating value: ${value}. Must be an integer between 1 and 5.`,
    );
  }
}
