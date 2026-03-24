export interface ShipmentOutput {
  id: string;
  orderId: string;
  carrierId: string;
  trackingNumber: string | null;
  status: string;
  cancelReason: string | null;
  originCountry: string;
  destinationCountry: string;
  weightGrams: number;
  rateCents: number | null;
  rateCurrency: string | null;
  estimatedDeliveryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
