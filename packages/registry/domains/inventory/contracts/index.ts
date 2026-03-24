export type {
  InventoryInitializeStockInput,
  InventoryAdjustStockInput,
  InventoryReserveStockInput,
  InventoryRestockInput,
  IInventoryService,
} from "./inventory.contract.js";

export { createInventoryService } from "./inventory.factory.js";
export type { InventoryServiceDeps } from "./inventory.factory.js";

export type { StockLevelOutput } from "../application/dto/stock-level-output.dto.js";
export type { ReservationOutput } from "../application/dto/reservation-output.dto.js";
