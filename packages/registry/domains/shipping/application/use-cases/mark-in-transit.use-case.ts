import { Result } from "../../shared/result.js";
import { ShipmentNotFound } from "../../domain/errors/shipment-not-found.error.js";
import { ShipmentInTransit } from "../../domain/events/shipment-in-transit.event.js";
import type { InvalidShipmentTransition } from "../../domain/errors/invalid-shipment-transition.error.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";

export class MarkInTransit {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(
    shipmentId: string,
  ): Promise<Result<{ event: ShipmentInTransit }, ShipmentNotFound | InvalidShipmentTransition>> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Result.fail(ShipmentNotFound.create(shipmentId));
    }

    const transitResult = shipment.markInTransit();
    if (transitResult.isFail()) {
      return Result.fail(transitResult.unwrapError());
    }

    const inTransit = transitResult.unwrap();
    await this.shipmentRepository.update(inTransit);

    const event = new ShipmentInTransit(inTransit.id);
    return Result.ok({ event });
  }
}
