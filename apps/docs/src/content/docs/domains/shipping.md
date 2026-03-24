---
title: Shipping Domain
description: Shipment lifecycle management with carrier integration, rate calculation, tracking, and delivery estimation for TypeScript backends.
---

The `shipping` domain provides **shipment lifecycle management, carrier integration, and rate calculation**. It tracks shipments from creation through delivery and supports multiple carriers.

## Install

```bash
npx @backcap/cli add shipping
```

## Domain Model

### Shipment Entity

Represents an order shipment with a state machine: `created → dispatched → in_transit → delivered` (or `canceled`).

```typescript
import { Shipment } from "./domains/shipping/domain/entities/shipment.entity";

const shipment = Shipment.create({
  id: crypto.randomUUID(),
  orderId: "order-42",
  carrierId: "fedex",
  status: "created",
  originAddress: { street: "1 Main St", city: "Paris", country: "FR", postalCode: "75001" },
  destinationAddress: { street: "5 Oak Ave", city: "Lyon", country: "FR", postalCode: "69001" },
});

const dispatched = shipment.unwrap().dispatch("TRACK-123456");
```

### Carrier Entity

Shipping carrier definitions with supported zones and service types.

```typescript
import { Carrier } from "./domains/shipping/domain/entities/carrier.entity";

const carrier = Carrier.create({
  id: "fedex",
  name: "FedEx",
  supportedZones: ["EU", "US", "APAC"],
});
```

### Value Objects

- **`ShipmentStatus`** — `created`, `dispatched`, `in_transit`, `delivered`, `canceled`
- **`ShippingZone`** — geographic shipping region
- **`TrackingNumber`** — validated carrier tracking identifier

## Use Cases

| Use Case | Description |
|----------|-------------|
| `CreateShipment` | Initialize a shipment for an order |
| `DispatchShipment` | Assign tracking number, move to dispatched |
| `MarkInTransit` | Update status to in-transit |
| `DeliverShipment` | Mark as delivered |
| `CancelShipment` | Cancel with optional reason |
| `GetShipment` | Retrieve shipment details |
| `ListShipments` | List shipments with filters |
| `GetRates` | Get shipping rates from carrier |
| `EstimateDelivery` | Calculate estimated delivery date range |

## Ports

- **`IShipmentRepository`** — `findById`, `findByOrderId`, `save`
- **`ICarrierRepository`** — `findById`, `findAll`
- **`IShippingProvider`** — `getRates`, `estimateDelivery`

## Contract & Factory

```typescript
import { createShippingService } from "./domains/shipping/contracts";

const shipping = createShippingService({
  shipmentRepository: myShipmentRepo,
  carrierRepository: myCarrierRepo,
  shippingProvider: myShippingProvider,
});

const rates = await shipping.getRates({
  carrierId: "fedex",
  origin: { country: "FR", postalCode: "75001" },
  destination: { country: "FR", postalCode: "69001" },
  weight: 2.5,
});
```

## Domain Events

| Event | Payload |
|-------|---------|
| `ShipmentCreated` | shipmentId, orderId, carrierId |
| `ShipmentDispatched` | shipmentId, trackingNumber |
| `ShipmentInTransit` | shipmentId |
| `ShipmentDelivered` | shipmentId, deliveredAt |
| `ShipmentCanceled` | shipmentId, reason |
