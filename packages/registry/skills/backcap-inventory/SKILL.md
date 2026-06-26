---
name: backcap-inventory
description: Inventory domain for Backcap — domain-first clean architecture for multi-warehouse stock management, reservations, and availability. Tracks stock levels per SKU per warehouse with safe total/reserved/available arithmetic via the Quantity value object, manages time-boxed reservations (reserve, confirm, release, expire) against a referenceId/referenceType, emits low-stock alerts when available quantity drops at or below a threshold, and persists through IStockRepository and IReservationRepository ports. Use when building warehouse stock tracking, order reservation flows, availability checks, or low-stock alerting.
metadata:
  author: backcap
  version: 0.1.0
---

# Inventory Domain

## Domain Map

```
domains/inventory/
├── domain/
│   ├── entities/
│   │   ├── stock-level.entity.ts     → StockLevel (id, sku, warehouseId, total/reserved/available, lowStockThreshold; reserve, releaseReserved, confirmReserved, restock, adjustTotal)
│   │   └── reservation.entity.ts     → Reservation (id, sku, warehouseId, quantity, status, referenceId/Type, expiresAt; confirm, release, expire)
│   ├── value-objects/
│   │   ├── quantity.vo.ts             → Quantity (non-negative integer, safe add/subtract)
│   │   ├── warehouse-id.vo.ts         → WarehouseId (non-empty, max 100 chars)
│   │   └── reservation-status.vo.ts   → ReservationStatus (pending, confirmed, released, expired)
│   ├── events/
│   │   ├── stock-initialized.event.ts    → StockInitialized
│   │   ├── stock-adjusted.event.ts       → StockAdjusted
│   │   ├── stock-restocked.event.ts      → StockRestocked
│   │   ├── stock-reserved.event.ts       → StockReserved
│   │   ├── reservation-confirmed.event.ts → ReservationConfirmed
│   │   ├── reservation-released.event.ts  → ReservationReleased
│   │   └── low-stock-alert.event.ts      → LowStockAlert
│   ├── errors/
│   │   ├── insufficient-stock.error.ts          → InsufficientStock
│   │   ├── invalid-stock-quantity.error.ts      → InvalidStockQuantity
│   │   ├── stock-not-found.error.ts             → StockNotFound
│   │   ├── stock-already-exists.error.ts        → StockAlreadyExists
│   │   ├── invalid-sku.error.ts                 → InvalidSku
│   │   ├── invalid-warehouse-id.error.ts        → InvalidWarehouseId
│   │   ├── reservation-not-found.error.ts       → ReservationNotFound
│   │   ├── reservation-expired.error.ts         → ReservationExpired
│   │   ├── invalid-reservation-status.error.ts  → InvalidReservationStatus
│   │   ├── invalid-reservation-reference.error.ts → InvalidReservationReference
│   │   ├── invalid-reservation-expiry.error.ts  → InvalidReservationExpiry
│   │   └── invalid-reservation-state.error.ts   → InvalidReservationState
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── initialize-stock.use-case.ts     → InitializeStock
│   │   ├── adjust-stock.use-case.ts         → AdjustStock
│   │   ├── restock.use-case.ts              → Restock
│   │   ├── reserve-stock.use-case.ts        → ReserveStock
│   │   ├── confirm-reservation.use-case.ts  → ConfirmReservation
│   │   ├── release-reservation.use-case.ts  → ReleaseReservation
│   │   ├── get-stock-level.use-case.ts      → GetStockLevel
│   │   ├── check-availability.use-case.ts   → CheckAvailability
│   │   └── mappers.adapter.ts               → toStockLevelOutput / toReservationOutput
│   ├── ports/
│   │   ├── stock-repository.port.ts        → IStockRepository (findById, findBySkuAndWarehouse, findBySku, save, update)
│   │   └── reservation-repository.port.ts  → IReservationRepository (findById, findByReference, findPendingBySku, save, update)
│   ├── dto/
│   │   ├── initialize-stock-input.dto.ts
│   │   ├── adjust-stock-input.dto.ts
│   │   ├── restock-input.dto.ts
│   │   ├── reserve-stock-input.dto.ts
│   │   ├── stock-level-output.dto.ts
│   │   └── reservation-output.dto.ts
│   └── __tests__/
├── contracts/
│   ├── inventory.contract.ts → IInventoryService
│   ├── inventory.factory.ts  → createInventoryService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Stock per SKU per warehouse**: A `StockLevel` is uniquely keyed by `(sku, warehouseId)`. Stock across warehouses is tracked independently, and availability checks (`checkAvailability`) fan out across every warehouse holding a SKU.
- **Reservations**: Reserving moves quantity from available to reserved without decrementing total; reservations are time-boxed via `expiresAt` and tied to a `referenceId`/`referenceType` (e.g. an order). Confirming decrements total, releasing/expiring returns the quantity. State transitions go through `ReservationStatus` (pending → confirmed/released/expired) and are idempotent.
- **Availability arithmetic**: The `Quantity` value object enforces non-negative integers and exposes safe `add`/`subtract`; `available = total - reserved` is computed and can never go negative by construction.
- **Low-stock alerts**: Whenever available quantity drops at or below `lowStockThreshold`, the relevant use case emits a `LowStockAlert` event alongside its primary event for downstream notification.
- **Result type**: Every fallible operation returns `Result<T, E>` with an exact error union (no thrown exceptions in the domain), so callers exhaustively handle typed failures like `InsufficientStock`, `StockNotFound`, or `ReservationExpired`.
- **Ports**: Persistence is abstracted behind `IStockRepository` and `IReservationRepository`; the domain has zero knowledge of the storage engine, and adapters are wired in via `createInventoryService(deps)`.
