export class FlagNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlagNotFound";
  }

  static create(key: string): FlagNotFound {
    return new FlagNotFound(`Feature flag not found with key: "${key}"`);
  }
}
