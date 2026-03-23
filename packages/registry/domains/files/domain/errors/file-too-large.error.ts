export class FileTooLarge extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileTooLarge";
  }

  static create(size: number, maxSize: number): FileTooLarge {
    return new FileTooLarge(
      `File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
    );
  }
}
