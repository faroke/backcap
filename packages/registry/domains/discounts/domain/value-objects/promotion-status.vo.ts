import { Result } from "../../shared/result.js";
import { InvalidPromotionStatus } from "../errors/invalid-promotion-status.error.js";

export type PromotionStatusValue = "draft" | "active" | "inactive" | "expired";

const VALID_STATUSES: PromotionStatusValue[] = ["draft", "active", "inactive", "expired"];

export class PromotionStatus {
  readonly value: PromotionStatusValue;

  private constructor(value: PromotionStatusValue) {
    this.value = value;
  }

  static from(value: string): Result<PromotionStatus, InvalidPromotionStatus> {
    if (!VALID_STATUSES.includes(value as PromotionStatusValue)) {
      return Result.fail(InvalidPromotionStatus.create(value, VALID_STATUSES));
    }
    return Result.ok(new PromotionStatus(value as PromotionStatusValue));
  }

  static draft(): PromotionStatus {
    return new PromotionStatus("draft");
  }

  static active(): PromotionStatus {
    return new PromotionStatus("active");
  }

  isDraft(): boolean {
    return this.value === "draft";
  }

  isActive(): boolean {
    return this.value === "active";
  }

  isInactive(): boolean {
    return this.value === "inactive";
  }

  isExpired(): boolean {
    return this.value === "expired";
  }

  canActivate(): boolean {
    return this.isDraft() || this.isInactive();
  }

  canDeactivate(): boolean {
    return this.isActive();
  }
}
