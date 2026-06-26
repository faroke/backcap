import { Result } from "../../shared/result.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { toStockLevelOutput } from "./mappers.adapter.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { StockLevelOutput } from "../dto/stock-level-output.dto.js";

export class GetStockLevel {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(sku: string, warehouseId: string): Promise<Result<StockLevelOutput, StockNotFound>> {
    const stock = await this.stockRepository.findBySkuAndWarehouse(sku, warehouseId);
    if (!stock) {
      return Result.fail(StockNotFound.create(sku, warehouseId));
    }

    return Result.ok(toStockLevelOutput(stock));
  }
}
