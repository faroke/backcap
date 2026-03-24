import type { Result } from "../shared/result.js";
import type { ShipmentOutput } from "../application/dto/shipment-output.dto.js";
import type { CreateShipmentInput } from "../application/dto/create-shipment-input.dto.js";
import type { GetRateInput } from "../application/dto/get-rate-input.dto.js";
import type { RateOutput } from "../application/dto/rate-output.dto.js";

export type { ShipmentOutput } from "../application/dto/shipment-output.dto.js";
export type { CreateShipmentInput } from "../application/dto/create-shipment-input.dto.js";
export type { GetRateInput } from "../application/dto/get-rate-input.dto.js";
export type { RateOutput } from "../application/dto/rate-output.dto.js";

export interface IShippingService {
  createShipment(input: CreateShipmentInput): Promise<Result<{ shipmentId: string }, Error>>;
  dispatchShipment(shipmentId: string, trackingNumber: string): Promise<Result<void, Error>>;
  markInTransit(shipmentId: string): Promise<Result<void, Error>>;
  deliverShipment(shipmentId: string): Promise<Result<void, Error>>;
  cancelShipment(shipmentId: string, reason?: string): Promise<Result<void, Error>>;
  getShipment(shipmentId: string): Promise<Result<ShipmentOutput, Error>>;
  listShipments(): Promise<Result<ShipmentOutput[], Error>>;
  getRates(input: GetRateInput): Promise<Result<RateOutput[], Error>>;
  estimateDelivery(input: GetRateInput): Promise<Result<{ estimatedMinDays: number; estimatedMaxDays: number; estimatedDate: Date }, Error>>;
}
