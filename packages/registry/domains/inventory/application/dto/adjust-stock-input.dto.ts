export interface AdjustStockInput {
  sku: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}
