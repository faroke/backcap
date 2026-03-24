import { Result } from "../../shared/result.js";
import { toStockLevelOutput } from "./mappers.adapter.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { StockLevelOutput } from "../dto/stock-level-output.dto.js";

export class CheckAvailability {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(sku: string): Promise<Result<StockLevelOutput[], Error>> {
    const stocks = await this.stockRepository.findBySku(sku);
    return Result.ok(stocks.map(toStockLevelOutput));
  }
}
