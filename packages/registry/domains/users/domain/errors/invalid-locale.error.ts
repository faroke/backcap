export class InvalidLocale extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidLocale";
  }

  static create(value: string): InvalidLocale {
    return new InvalidLocale(
      `Invalid locale: "${value}". Must be a valid BCP-47 language tag.`,
    );
  }
}
