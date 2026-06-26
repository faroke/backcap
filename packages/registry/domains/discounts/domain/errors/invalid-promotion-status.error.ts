export class InvalidPromotionStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPromotionStatus";
  }

  static create(value: string, validStatuses: readonly string[]): InvalidPromotionStatus {
    return new InvalidPromotionStatus(`Invalid promotion status: "${value}". Valid: ${validStatuses.join(", ")}`);
  }
}
