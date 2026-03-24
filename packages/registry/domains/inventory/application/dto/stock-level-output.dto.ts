export interface StockLevelOutput {
  id: string;
  sku: string;
  warehouseId: string;
  total: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}
