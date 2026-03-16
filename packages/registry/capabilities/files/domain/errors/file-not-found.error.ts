export class FileNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileNotFound";
  }

  static create(fileId: string): FileNotFound {
    return new FileNotFound(`File not found with id: "${fileId}"`);
  }
}
