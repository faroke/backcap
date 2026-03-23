export class InvalidFilePath extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFilePath";
  }

  static create(path: string): InvalidFilePath {
    return new InvalidFilePath(`Invalid file path: "${path}"`);
  }
}
