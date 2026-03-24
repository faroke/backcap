export interface ReserveStockInput {
  sku: string;
  warehouseId: string;
  quantity: number;
  referenceId: string;
  referenceType: string;
  expiresInMinutes?: number;
}
