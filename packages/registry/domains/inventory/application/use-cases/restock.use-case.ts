import { Result } from "../../shared/result.js";
import { StockNotFound } from "../../domain/errors/stock-not-found.error.js";
import { StockRestocked } from "../../domain/events/stock-restocked.event.js";
import type { IStockRepository } from "../ports/stock-repository.port.js";
import type { RestockInput } from "../dto/restock-input.dto.js";

export class Restock {
  constructor(private readonly stockRepository: IStockRepository) {}

  async execute(
    input: RestockInput,
  ): Promise<Result<{ event: StockRestocked }, Error>> {
    const stock = await this.stockRepository.findBySkuAndWarehouse(input.sku, input.warehouseId);
    if (!stock) {
      return Result.fail(StockNotFound.create(input.sku, input.warehouseId));
    }

    const restockResult = stock.restock(input.quantity);
    if (restockResult.isFail()) {
      return Result.fail(restockResult.unwrapError());
    }

    const updated = restockResult.unwrap();
    await this.stockRepository.update(updated);

    const event = new StockRestocked(
      updated.sku,
      updated.warehouseId.value,
      input.quantity,
      updated.total.value,
    );

    return Result.ok({ event });
  }
}
