import type { Result } from "../shared/result.js";
import type { ShipmentOutput } from "../application/dto/shipment-output.dto.js";
import type { CreateShipmentInput } from "../application/dto/create-shipment-input.dto.js";
import type { GetRateInput } from "../application/dto/get-rate-input.dto.js";
import type { RateOutput } from "../application/dto/rate-output.dto.js";

import type { CarrierNotFound } from "../domain/errors/carrier-not-found.error.js";
import type { CarrierInactive } from "../domain/errors/carrier-inactive.error.js";
import type { ShipmentNotFound } from "../domain/errors/shipment-not-found.error.js";
import type { InvalidShipmentTransition } from "../domain/errors/invalid-shipment-transition.error.js";
import type { InvalidTrackingNumber } from "../domain/errors/invalid-tracking-number.error.js";
import type { InvalidShippingZone } from "../domain/errors/invalid-shipping-zone.error.js";
import type { InvalidShipment } from "../domain/errors/invalid-shipment.error.js";
import type { InvalidShipmentStatus } from "../domain/errors/invalid-shipment-status.error.js";
import type { NoRateAvailable } from "../domain/errors/no-rate-available.error.js";

export type { ShipmentOutput } from "../application/dto/shipment-output.dto.js";
export type { CreateShipmentInput } from "../application/dto/create-shipment-input.dto.js";
export type { GetRateInput } from "../application/dto/get-rate-input.dto.js";
export type { RateOutput } from "../application/dto/rate-output.dto.js";

export interface IShippingService {
  createShipment(
    input: CreateShipmentInput,
  ): Promise<
    Result<
      { shipmentId: string },
      CarrierNotFound | CarrierInactive | InvalidShippingZone | InvalidShipment | InvalidShipmentStatus
    >
  >;
  dispatchShipment(
    shipmentId: string,
    trackingNumber: string,
  ): Promise<Result<void, ShipmentNotFound | InvalidTrackingNumber | InvalidShipmentTransition>>;
  markInTransit(shipmentId: string): Promise<Result<void, ShipmentNotFound | InvalidShipmentTransition>>;
  deliverShipment(shipmentId: string): Promise<Result<void, ShipmentNotFound | InvalidShipmentTransition>>;
  cancelShipment(
    shipmentId: string,
    reason?: string,
  ): Promise<Result<void, ShipmentNotFound | InvalidShipmentTransition>>;
  getShipment(shipmentId: string): Promise<Result<ShipmentOutput, ShipmentNotFound>>;
  listShipments(): Promise<Result<ShipmentOutput[], never>>;
  getRates(input: GetRateInput): Promise<Result<RateOutput[], InvalidShippingZone>>;
  estimateDelivery(
    input: GetRateInput,
  ): Promise<
    Result<
      { estimatedMinDays: number; estimatedMaxDays: number; estimatedDate: Date },
      InvalidShippingZone | NoRateAvailable
    >
  >;
}
