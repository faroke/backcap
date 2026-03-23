export class InvalidAuditAction extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAuditAction";
  }

  static create(value: string): InvalidAuditAction {
    return new InvalidAuditAction(
      `Invalid audit action: "${value}". Must match NOUN.VERB format (e.g., USER.LOGIN)`,
    );
  }
}
