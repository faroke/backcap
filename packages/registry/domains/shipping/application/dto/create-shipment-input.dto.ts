export interface CreateShipmentInput {
  orderId: string;
  carrierId: string;
  originCountry: string;
  destinationCountry: string;
  weightGrams: number;
}
