export class IndexNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IndexNotFound";
  }

  static create(indexName: string): IndexNotFound {
    return new IndexNotFound(`Search index not found: "${indexName}"`);
  }
}
