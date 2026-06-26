import { Result } from "../../shared/result.js";
import { InvalidWarehouseId } from "../errors/invalid-warehouse-id.error.js";

export class WarehouseId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<WarehouseId, InvalidWarehouseId> {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length === 0) {
      return Result.fail(InvalidWarehouseId.create("Warehouse ID cannot be empty"));
    }
    if (trimmed.length > 100) {
      return Result.fail(InvalidWarehouseId.create("Warehouse ID cannot exceed 100 characters"));
    }
    return Result.ok(new WarehouseId(trimmed));
  }

  equals(other: WarehouseId): boolean {
    return this.value === other.value;
  }
}
