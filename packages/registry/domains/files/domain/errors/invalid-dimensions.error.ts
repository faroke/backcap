export class InvalidDimensions extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDimensions";
  }

  static create(dimension: "width" | "height", value: number): InvalidDimensions {
    const label = dimension === "width" ? "Width" : "Height";
    return new InvalidDimensions(`${label} must be a positive integer, got: ${value}`);
  }
}
