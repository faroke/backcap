import { Result } from "../../shared/result.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { StockAdjusted } from "../../domain/events/stock-adjusted.event.js";
import { LowStockAlert } from "../../domain/events/low-stock-alert.event.js";
import type { InvalidStockQuantity } from "../../domain/errors/invalid-stock-quantity.error.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { AdjustStockInput } from "../dto/adjust-stock-input.dto.js";

export class AdjustStock {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(
    input: AdjustStockInput,
  ): Promise<
    Result<{ event: StockAdjusted; alert?: LowStockAlert | undefined }, StockNotFound | InvalidStockQuantity>
  > {
    const stock = await this.stockRepository.findBySkuAndWarehouse(input.sku, input.warehouseId);
    if (!stock) {
      return Result.fail(StockNotFound.create(input.sku, input.warehouseId));
    }

    const previousQuantity = stock.total.value;
    const adjustResult = stock.adjustTotal(input.newQuantity, input.reason);
    if (adjustResult.isFail()) {
      return Result.fail(adjustResult.unwrapError());
    }

    const updated = adjustResult.unwrap();
    await this.stockRepository.update(updated);

    const event = new StockAdjusted(
      updated.sku,
      updated.warehouseId.value,
      previousQuantity,
      updated.total.value,
      input.reason,
    );

    const alert = updated.isLowStock
      ? new LowStockAlert(
          updated.sku,
          updated.warehouseId.value,
          updated.available.value,
          updated.lowStockThreshold,
        )
      : undefined;

    return Result.ok({ event, alert });
  }
}
