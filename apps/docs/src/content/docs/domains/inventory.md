---
title: Inventory Domain
description: Stock management across warehouses with reservations, low-stock alerts, and availability checks for TypeScript backends.
---

The `inventory` domain provides **stock management, reservations, and availability tracking** across multiple warehouses. It supports time-limited reservations and emits low-stock alerts.

## Install

```bash
npx @backcap/cli add inventory
```

## Domain Model

### StockLevel Entity

Tracks total, reserved, and available stock per SKU and warehouse.

```typescript
import { StockLevel } from "./domains/inventory/domain/entities/stock-level.entity";

const stock = StockLevel.create({
  id: crypto.randomUUID(),
  sku: "SKU-001",
  warehouseId: "warehouse-eu",
  total: 100,
  reserved: 5,
});

stock.unwrap().available; // 95
```

### Reservation Entity

Time-limited stock holds for orders, with a state machine: `pending → confirmed | released | expired`.

```typescript
import { Reservation } from "./domains/inventory/domain/entities/reservation.entity";

const reservation = Reservation.create({
  id: crypto.randomUUID(),
  sku: "SKU-001",
  warehouseId: "warehouse-eu",
  quantity: 2,
  orderId: "order-42",
  expiresAt: new Date(Date.now() + 15 * 60_000), // 15 min hold
});

const confirmed = reservation.unwrap().confirm();
```

### Value Objects

- **`Quantity`** — non-negative integer
- **`WarehouseId`** — validated warehouse identifier
- **`ReservationStatus`** — `pending`, `confirmed`, `released`, `expired`

## Use Cases

| Use Case | Description |
|----------|-------------|
| `InitializeStock` | Create stock level for a SKU in a warehouse |
| `AdjustStock` | Modify stock quantity with reason tracking |
| `ReserveStock` | Reserve stock with optional expiration |
| `ReleaseReservation` | Cancel a reservation |
| `ConfirmReservation` | Convert reservation to confirmed |
| `Restock` | Add stock quantity |
| `GetStockLevel` | Fetch current stock for SKU/warehouse |
| `CheckAvailability` | Get all warehouses' stock for a SKU |

## Ports

- **`IStockRepository`** — `findBySkuAndWarehouse`, `findBySku`, `save`
- **`IReservationRepository`** — `findById`, `save`

## Contract & Factory

```typescript
import { createInventoryService } from "./domains/inventory/contracts";

const inventory = createInventoryService({
  stockRepository: myStockRepo,
  reservationRepository: myReservationRepo,
});

await inventory.reserveStock({
  sku: "SKU-001",
  warehouseId: "warehouse-eu",
  quantity: 2,
  orderId: "order-42",
  expiresAt: new Date(Date.now() + 15 * 60_000),
});
```

## Domain Events

| Event | Payload |
|-------|---------|
| `StockInitialized` | sku, warehouseId, total |
| `StockAdjusted` | sku, warehouseId, quantity, reason |
| `StockReserved` | sku, warehouseId, quantity, orderId |
| `ReservationReleased` | reservationId |
| `ReservationConfirmed` | reservationId |
| `LowStockAlert` | sku, warehouseId, available, threshold |
| `StockRestocked` | sku, warehouseId, quantity |
