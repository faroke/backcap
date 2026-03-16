export class AuditQueryFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditQueryFailed";
  }

  static create(reason: string): AuditQueryFailed {
    return new AuditQueryFailed(`Audit query failed: ${reason}`);
  }
}
