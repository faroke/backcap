import { Result } from "../../shared/result.js";
import { InvalidProductStatus } from "../errors/invalid-product-status.error.js";

export type ProductStatusValue = "draft" | "active" | "archived";

export class ProductStatus {
  readonly value: ProductStatusValue;

  private constructor(value: ProductStatusValue) {
    this.value = value;
  }

  static draft(): ProductStatus {
    return new ProductStatus("draft");
  }

  static active(): ProductStatus {
    return new ProductStatus("active");
  }

  static archived(): ProductStatus {
    return new ProductStatus("archived");
  }

  static from(value: string): Result<ProductStatus, InvalidProductStatus> {
    if (value === "draft" || value === "active" || value === "archived") {
      return Result.ok(new ProductStatus(value));
    }
    return Result.fail(InvalidProductStatus.create(value));
  }

  isDraft(): boolean {
    return this.value === "draft";
  }

  isActive(): boolean {
    return this.value === "active";
  }

  isArchived(): boolean {
    return this.value === "archived";
  }

  equals(other: ProductStatus): boolean {
    return this.value === other.value;
  }
}
