import type { Shipment } from "../../domain/entities/shipment.entity.js";
import type { ShipmentOutput } from "../dto/shipment-output.dto.js";

export function toShipmentOutput(shipment: Shipment): ShipmentOutput {
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    carrierId: shipment.carrierId,
    trackingNumber: shipment.trackingNumber?.value ?? null,
    status: shipment.status.value,
    cancelReason: shipment.cancelReason,
    originCountry: shipment.zone.originCountry,
    destinationCountry: shipment.zone.destinationCountry,
    weightGrams: shipment.weightGrams,
    rateCents: shipment.rateCents,
    rateCurrency: shipment.rateCurrency,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
}
