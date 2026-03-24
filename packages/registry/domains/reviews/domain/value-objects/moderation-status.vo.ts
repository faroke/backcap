export type ModerationStatusValue = "pending" | "approved" | "rejected";

export class ModerationStatus {
  readonly value: ModerationStatusValue;

  private constructor(value: ModerationStatusValue) {
    this.value = value;
  }

  static from(value: ModerationStatusValue): ModerationStatus {
    return new ModerationStatus(value);
  }

  static pending(): ModerationStatus {
    return new ModerationStatus("pending");
  }

  static approved(): ModerationStatus {
    return new ModerationStatus("approved");
  }

  static rejected(): ModerationStatus {
    return new ModerationStatus("rejected");
  }

  isPending(): boolean {
    return this.value === "pending";
  }

  isApproved(): boolean {
    return this.value === "approved";
  }

  isRejected(): boolean {
    return this.value === "rejected";
  }
}
