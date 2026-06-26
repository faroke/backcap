import { Result } from "../../shared/result.js";
import { ShipmentNotFound } from "../../domain/errors/shipment-not-found.error.js";
import { ShipmentDelivered } from "../../domain/events/shipment-delivered.event.js";
import type { InvalidShipmentTransition } from "../../domain/errors/invalid-shipment-transition.error.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";

export class DeliverShipment {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(
    shipmentId: string,
  ): Promise<Result<{ event: ShipmentDelivered }, ShipmentNotFound | InvalidShipmentTransition>> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Result.fail(ShipmentNotFound.create(shipmentId));
    }

    const deliverResult = shipment.deliver();
    if (deliverResult.isFail()) {
      return Result.fail(deliverResult.unwrapError());
    }

    const delivered = deliverResult.unwrap();
    await this.shipmentRepository.update(delivered);

    const event = new ShipmentDelivered(delivered.id, delivered.updatedAt);
    return Result.ok({ event });
  }
}
