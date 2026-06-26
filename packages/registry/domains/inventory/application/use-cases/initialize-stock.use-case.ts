import { Result } from "../../shared/result.js";
import { StockLevel } from "../../domain/entities/stock-level.entity.js";
import { StockInitialized } from "../../domain/events/stock-initialized.event.js";
import { StockAlreadyExists } from "../../domain/errors/stock-already-exists.error.js";
import type { InvalidSku } from "../../domain/errors/invalid-sku.error.js";
import type { InvalidWarehouseId } from "../../domain/errors/invalid-warehouse-id.error.js";
import type { InvalidStockQuantity } from "../../domain/errors/invalid-stock-quantity.error.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { InitializeStockInput } from "../dto/initialize-stock-input.dto.js";

export class InitializeStock {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(
    input: InitializeStockInput,
  ): Promise<
    Result<
      { stockLevelId: string; event: StockInitialized },
      StockAlreadyExists | InvalidSku | InvalidWarehouseId | InvalidStockQuantity
    >
  > {
    const existing = await this.stockRepository.findBySkuAndWarehouse(input.sku, input.warehouseId);
    if (existing) {
      return Result.fail(StockAlreadyExists.create(input.sku, input.warehouseId));
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
