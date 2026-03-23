export class DocumentNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentNotFound";
  }

  static create(documentId: string): DocumentNotFound {
    return new DocumentNotFound(`Document not found with id: "${documentId}"`);
  }
}
