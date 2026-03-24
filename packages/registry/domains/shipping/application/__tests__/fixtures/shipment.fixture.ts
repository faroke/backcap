import { Shipment } from "../../../domain/entities/shipment.entity.js";
import { ShippingZone } from "../../../domain/value-objects/shipping-zone.vo.js";
import type { TrackingNumber } from "../../../domain/value-objects/tracking-number.vo.js";

export const defaultZone = ShippingZone.create({ originCountry: "FR", destinationCountry: "US" }).unwrap();

export function createTestShipment(
  overrides?: Partial<{
    id: string;
    orderId: string;
    carrierId: string;
    zone: ShippingZone;
    weightGrams: number;
    status: string;
    trackingNumber: TrackingNumber;
  }>,
): Shipment {
  const result = Shipment.create({
    id: overrides?.id ?? "shipment-1",
    orderId: overrides?.orderId ?? "order-1",
    carrierId: overrides?.carrierId ?? "carrier-1",
    zone: overrides?.zone ?? defaultZone,
    weightGrams: overrides?.weightGrams ?? 500,
    status: overrides?.status,
    trackingNumber: overrides?.trackingNumber,
  });
  if (result.isFail()) {
    throw new Error(`Failed to create test shipment: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
