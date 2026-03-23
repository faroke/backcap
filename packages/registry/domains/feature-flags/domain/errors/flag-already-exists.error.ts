export class FlagAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlagAlreadyExists";
  }

  static create(key: string): FlagAlreadyExists {
    return new FlagAlreadyExists(`Feature flag already exists with key: "${key}"`);
  }
}
