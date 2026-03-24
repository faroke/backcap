import type { IStockRepository } from "../application/ports/stock-repository.port.js";
import type { IReservationRepository } from "../application/ports/reservation-repository.port.js";
import { InitializeStock } from "../application/use-cases/initialize-stock.use-case.js";
import { AdjustStock } from "../application/use-cases/adjust-stock.use-case.js";
import { ReserveStock } from "../application/use-cases/reserve-stock.use-case.js";
import { ReleaseReservation } from "../application/use-cases/release-reservation.use-case.js";
import { ConfirmReservation } from "../application/use-cases/confirm-reservation.use-case.js";
import { Restock } from "../application/use-cases/restock.use-case.js";
import { GetStockLevel } from "../application/use-cases/get-stock-level.use-case.js";
import { CheckAvailability } from "../application/use-cases/check-availability.use-case.js";
import type { IInventoryService } from "./inventory.contract.js";
import { Result } from "../shared/result.js";

export type InventoryServiceDeps = {
  stockRepository: IStockRepository;
  reservationRepository: IReservationRepository;
};

export function createInventoryService(deps: InventoryServiceDeps): IInventoryService {
  const initializeStock = new InitializeStock(deps.stockRepository);
  const adjustStock = new AdjustStock(deps.stockRepository);
  const reserveStock = new ReserveStock(deps.stockRepository, deps.reservationRepository);
  const releaseReservation = new ReleaseReservation(deps.stockRepository, deps.reservationRepository);
  const confirmReservation = new ConfirmReservation(deps.stockRepository, deps.reservationRepository);
  const restock = new Restock(deps.stockRepository);
  const getStockLevel = new GetStockLevel(deps.stockRepository);
  const checkAvailability = new CheckAvailability(deps.stockRepository);

  return {
    initializeStock: (input) =>
      initializeStock.execute(input).then((r) =>
        r.isOk() ? Result.ok({ stockLevelId: r.unwrap().stockLevelId }) : Result.fail(r.unwrapError()),
      ),
    adjustStock: (input) =>
      adjustStock.execute(input).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    reserveStock: (input) =>
      reserveStock.execute(input).then((r) =>
        r.isOk() ? Result.ok({ reservationId: r.unwrap().reservationId }) : Result.fail(r.unwrapError()),
      ),
    releaseReservation: (reservationId) =>
      releaseReservation.execute(reservationId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    confirmReservation: (reservationId) =>
      confirmReservation.execute(reservationId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    restock: (input) =>
      restock.execute(input).then((r) =>
        r.isOk() ? Result.ok({ newTotal: r.unwrap().event.newTotal }) : Result.fail(r.unwrapError()),
      ),
    getStockLevel: (sku, warehouseId) => getStockLevel.execute(sku, warehouseId),
    checkAvailability: (sku) => checkAvailability.execute(sku),
  };
}
