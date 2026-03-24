export interface InitializeStockInput {
  sku: string;
  warehouseId: string;
  quantity: number;
  lowStockThreshold?: number;
}
