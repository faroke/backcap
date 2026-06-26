export class InvalidVariant extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVariant";
  }

  static emptyUrl(): InvalidVariant {
    return new InvalidVariant("Variant URL cannot be empty");
  }

  static emptyFormat(): InvalidVariant {
    return new InvalidVariant("Variant format cannot be empty");
  }
}
