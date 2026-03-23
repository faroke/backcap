export class UnsupportedFormat extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFormat";
  }

  static create(mimeType: string): UnsupportedFormat {
    return new UnsupportedFormat(`Unsupported media format: "${mimeType}"`);
  }
}
