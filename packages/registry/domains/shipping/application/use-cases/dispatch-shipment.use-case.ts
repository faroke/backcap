import { Result } from "../../../shared/result.js";
import { TrackingNumber } from "../../domain/value-objects/tracking-number.vo.js";
import { ShipmentNotFound } from "../../domain/errors/shipment-not-found.error.js";
import { ShipmentDispatched } from "../../domain/events/shipment-dispatched.event.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";

export class DispatchShipment {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(shipmentId: string, trackingValue: string): Promise<Result<{ event: ShipmentDispatched }, Error>> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Result.fail(ShipmentNotFound.create(shipmentId));
    }

    const trackingResult = TrackingNumber.create(trackingValue);
    if (trackingResult.isFail()) {
      return Result.fail(trackingResult.unwrapError());
    }

    const dispatchResult = shipment.dispatch(trackingResult.unwrap());
    if (dispatchResult.isFail()) {
      return Result.fail(dispatchResult.unwrapError());
    }

    const dispatched = dispatchResult.unwrap();
    await this.shipmentRepository.update(dispatched);

    const event = new ShipmentDispatched(dispatched.id, dispatched.trackingNumber!.value);
    return Result.ok({ event });
  }
}
