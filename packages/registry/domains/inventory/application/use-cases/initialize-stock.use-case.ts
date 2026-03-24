import { Result } from "../../shared/result.js";
import { StockLevel } from "../../domain/entities/stock-level.entity.js";
import { StockInitialized } from "../../domain/events/stock-initialized.event.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { InitializeStockInput } from "../dto/initialize-stock-input.dto.js";

export class InitializeStock {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(
    input: InitializeStockInput,
  ): Promise<Result<{ stockLevelId: string; event: StockInitialized }, Error>> {
    const existing = await this.stockRepository.findBySkuAndWarehouse(input.sku, input.warehouseId);
    if (existing) {
      return Result.fail(
        new Error(`Stock already exists for SKU "${input.sku}" in warehouse "${input.warehouseId}"`),
      );
    }

    const id = crypto.randomUUID();
    const stockResult = StockLevel.create({
      id,
      sku: input.sku,
      warehouseId: input.warehouseId,
      totalQuantity: input.quantity,
      lowStockThreshold: input.lowStockThreshold,
    });

    if (stockResult.isFail()) {
      return Result.fail(stockResult.unwrapError());
    }

    const stock = stockResult.unwrap();
    await this.stockRepository.save(stock);

    const event = new StockInitialized(stock.sku, stock.warehouseId.value, stock.total.value);

    return Result.ok({ stockLevelId: stock.id, event });
  }
}
