export class QueryFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryFailed";
  }

  static create(reason: string): QueryFailed {
    return new QueryFailed(`Activity query failed: ${reason}`);
  }
}
