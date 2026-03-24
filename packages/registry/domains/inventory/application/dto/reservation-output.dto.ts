export interface ReservationOutput {
  id: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  status: string;
  referenceId: string;
  referenceType: string;
  expiresAt: Date;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}
