export class InvalidPriority extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPriority";
  }

  static create(value: string): InvalidPriority {
    return new InvalidPriority(
      `Invalid job priority: "${value}". Must be one of: low, normal, high, critical`,
    );
  }
}
