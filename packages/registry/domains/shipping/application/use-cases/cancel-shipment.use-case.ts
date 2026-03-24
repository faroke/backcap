import { Result } from "../../../shared/result.js";
import { ShipmentNotFound } from "../../domain/errors/shipment-not-found.error.js";
import { ShipmentCanceled } from "../../domain/events/shipment-canceled.event.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";

export class CancelShipment {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(shipmentId: string, reason?: string): Promise<Result<{ event: ShipmentCanceled }, Error>> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Result.fail(ShipmentNotFound.create(shipmentId));
    }

    const cancelResult = shipment.cancel(reason);
    if (cancelResult.isFail()) {
      return Result.fail(cancelResult.unwrapError());
    }

    const canceled = cancelResult.unwrap();
    await this.shipmentRepository.update(canceled);

    const event = new ShipmentCanceled(canceled.id, canceled.cancelReason ?? "");
    return Result.ok({ event });
  }
}
