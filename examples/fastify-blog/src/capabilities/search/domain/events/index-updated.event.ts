export class IndexUpdated {
  public readonly indexId: string;
  public readonly indexName: string;
  public readonly documentCount: number;
  public readonly occurredAt: Date;

  constructor(
    indexId: string,
    indexName: string,
    documentCount: number,
    occurredAt: Date = new Date(),
  ) {
    this.indexId = indexId;
    this.indexName = indexName;
    this.documentCount = documentCount;
    this.occurredAt = occurredAt;
  }
}
