---
name: backcap-shipping
description: Shipping domain for Backcap — domain-first clean architecture for shipment fulfillment, carrier management, and rate shopping. Models the full shipment lifecycle (created → dispatched → in_transit → delivered, with cancellation) via an explicit state machine, vendor-independent rate calculation and delivery estimation through the IRateProvider port, carrier registration with supported shipping zones, and tracking-number validation. Use when building order fulfillment, carrier integrations (FedEx, UPS, DHL, etc.), shipping rate comparison, or delivery tracking systems.
metadata:
  author: backcap
  version: 0.1.0
---

# Shipping Domain

## Domain Map

```
domains/shipping/
├── domain/
│   ├── entities/
│   │   ├── shipment.entity.ts        → Shipment (id, orderId, carrierId, trackingNumber, status, zone, weightGrams, rate, lifecycle transitions)
│   │   └── carrier.entity.ts         → Carrier (id, name, code, supportedZones, active, activate/deactivate)
│   ├── value-objects/
│   │   ├── money.vo.ts               → Money (integer cents arithmetic, currency ISO 4217)
│   │   ├── shipment-status.vo.ts     → ShipmentStatus (created, dispatched, in_transit, delivered, canceled + valid transitions)
│   │   ├── shipping-zone.vo.ts       → ShippingZone (origin/destination ISO 3166 country codes, isDomestic)
│   │   └── tracking-number.vo.ts     → TrackingNumber (format + length validation, normalized uppercase)
│   ├── events/
│   │   ├── shipment-created.event.ts    → ShipmentCreated
│   │   ├── shipment-dispatched.event.ts → ShipmentDispatched
│   │   ├── shipment-in-transit.event.ts → ShipmentInTransit
│   │   ├── shipment-delivered.event.ts  → ShipmentDelivered
│   │   └── shipment-canceled.event.ts   → ShipmentCanceled
│   ├── errors/
│   │   ├── money.error.ts                      → MoneyError
│   │   ├── shipment-not-found.error.ts         → ShipmentNotFound
│   │   ├── carrier-not-found.error.ts          → CarrierNotFound
│   │   ├── carrier-inactive.error.ts           → CarrierInactive
│   │   ├── invalid-shipment.error.ts           → InvalidShipment
│   │   ├── invalid-shipment-status.error.ts    → InvalidShipmentStatus
│   │   ├── invalid-shipment-transition.error.ts → InvalidShipmentTransition
│   │   ├── invalid-shipping-zone.error.ts      → InvalidShippingZone
│   │   ├── invalid-carrier.error.ts            → InvalidCarrier
│   │   ├── invalid-tracking-number.error.ts    → InvalidTrackingNumber
│   │   └── no-rate-available.error.ts          → NoRateAvailable
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── create-shipment.use-case.ts   → CreateShipment
│   │   ├── dispatch-shipment.use-case.ts → DispatchShipment
│   │   ├── mark-in-transit.use-case.ts   → MarkInTransit
│   │   ├── deliver-shipment.use-case.ts  → DeliverShipment
│   │   ├── cancel-shipment.use-case.ts   → CancelShipment
│   │   ├── get-shipment.use-case.ts      → GetShipment
│   │   ├── list-shipments.use-case.ts    → ListShipments
│   │   ├── get-rate.use-case.ts          → GetRate
│   │   ├── estimate-delivery.use-case.ts → EstimateDelivery
│   │   └── mappers.adapter.ts            → toShipmentOutput (entity → DTO)
│   ├── ports/
│   │   ├── shipment-repository.port.ts → IShipmentRepository (findById, findByOrderId, findAll, save, update)
│   │   ├── carrier-repository.port.ts  → ICarrierRepository (findById, findByCode, findAll, save)
│   │   └── rate-provider.port.ts       → IRateProvider (getRates) + ShippingRateResult
│   ├── dto/
│   │   ├── create-shipment-input.dto.ts → CreateShipmentInput
│   │   ├── get-rate-input.dto.ts        → GetRateInput
│   │   ├── rate-output.dto.ts           → RateOutput
│   │   └── shipment-output.dto.ts       → ShipmentOutput
│   └── __tests__/
├── contracts/
│   ├── shipping.contract.ts → IShippingService
│   ├── shipping.factory.ts  → createShippingService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Shipment lifecycle state machine**: `ShipmentStatus` encodes the only legal transitions (created → dispatched → in_transit → delivered, plus created/dispatched → canceled). Entity methods (`dispatch`, `markInTransit`, `deliver`, `cancel`) reject illegal moves with `InvalidShipmentTransition`, keeping fulfillment state always valid.
- **Carrier integration via IRateProvider**: Real carriers (FedEx, UPS, DHL) implement the `IRateProvider` port; the domain has zero knowledge of carrier APIs. Carriers are registered as `Carrier` entities with `supportedZones`, and only active carriers can be assigned shipments (`CarrierInactive`).
- **Rate calculation & delivery estimation**: `GetRate` shops all available rates for a `ShippingZone` and weight, returning `RateOutput[]`; `EstimateDelivery` picks the fastest option and projects a delivery date, failing with `NoRateAvailable` when no carrier serves the route. `Money` uses integer-cents arithmetic to avoid floating-point drift.
- **Tracking & zone validation**: `TrackingNumber` normalizes and validates format/length on dispatch; `ShippingZone` validates ISO country codes and distinguishes domestic vs. international shipments.
- **Result type & precise errors**: Every fallible operation returns `Result<T, E>` with an exact typed-error union (never raw `Error`); never-failing operations use `Result<T, never>`. Immutable entities return new instances on every mutation.
