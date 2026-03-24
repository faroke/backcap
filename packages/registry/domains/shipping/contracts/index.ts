export type {
  ShipmentOutput,
  CreateShipmentInput,
  GetRateInput,
  RateOutput,
  IShippingService,
} from "./shipping.contract.js";

export { createShippingService } from "./shipping.factory.js";
export type { ShippingServiceDeps } from "./shipping.factory.js";
