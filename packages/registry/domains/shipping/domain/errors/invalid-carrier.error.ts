export class InvalidCarrier extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCarrier";
  }
  static missingId(): InvalidCarrier {
    return new InvalidCarrier("Carrier ID is required");
  }
  static missingName(): InvalidCarrier {
    return new InvalidCarrier("Carrier name is required");
  }
  static missingCode(): InvalidCarrier {
    return new InvalidCarrier("Carrier code is required");
  }
  static invalidCode(code: string): InvalidCarrier {
    return new InvalidCarrier(`Invalid carrier code: "${code}"`);
  }
}
