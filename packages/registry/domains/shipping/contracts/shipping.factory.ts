import type { IShipmentRepository } from "../application/ports/shipment-repository.port.js";
import type { ICarrierRepository } from "../application/ports/carrier-repository.port.js";
import type { IRateProvider } from "../application/ports/rate-provider.port.js";
import { CreateShipment } from "../application/use-cases/create-shipment.use-case.js";
import { DispatchShipment } from "../application/use-cases/dispatch-shipment.use-case.js";
import { MarkInTransit } from "../application/use-cases/mark-in-transit.use-case.js";
import { DeliverShipment } from "../application/use-cases/deliver-shipment.use-case.js";
import { CancelShipment } from "../application/use-cases/cancel-shipment.use-case.js";
import { GetShipment } from "../application/use-cases/get-shipment.use-case.js";
import { ListShipments } from "../application/use-cases/list-shipments.use-case.js";
import { GetRate } from "../application/use-cases/get-rate.use-case.js";
import { EstimateDelivery } from "../application/use-cases/estimate-delivery.use-case.js";
import type { IShippingService } from "./shipping.contract.js";
import { Result } from "../shared/result.js";

export type ShippingServiceDeps = {
  shipmentRepository: IShipmentRepository;
  carrierRepository: ICarrierRepository;
  rateProvider: IRateProvider;
};

export function createShippingService(deps: ShippingServiceDeps): IShippingService {
  const createShipment = new CreateShipment(deps.shipmentRepository, deps.carrierRepository);
  const dispatchShipment = new DispatchShipment(deps.shipmentRepository);
  const markInTransit = new MarkInTransit(deps.shipmentRepository);
  const deliverShipment = new DeliverShipment(deps.shipmentRepository);
  const cancelShipment = new CancelShipment(deps.shipmentRepository);
  const getShipment = new GetShipment(deps.shipmentRepository);
  const listShipments = new ListShipments(deps.shipmentRepository);
  const getRate = new GetRate(deps.rateProvider);
  const estimateDelivery = new EstimateDelivery(deps.rateProvider);

  return {
    createShipment: (input) =>
      createShipment.execute(input).then((r) =>
        r.isOk() ? Result.ok({ shipmentId: r.unwrap().shipmentId }) : Result.fail(r.unwrapError()),
      ),
    dispatchShipment: (shipmentId, trackingNumber) =>
      dispatchShipment.execute(shipmentId, trackingNumber).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    markInTransit: (shipmentId) =>
      markInTransit.execute(shipmentId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    deliverShipment: (shipmentId) =>
      deliverShipment.execute(shipmentId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    cancelShipment: (shipmentId, reason) =>
      cancelShipment.execute(shipmentId, reason).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    getShipment: (shipmentId) => getShipment.execute(shipmentId),
    listShipments: () => listShipments.execute(),
    getRates: (input) => getRate.execute(input),
    estimateDelivery: (input) => estimateDelivery.execute(input),
  };
}
