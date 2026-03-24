import { Result } from "../../../shared/result.js";
import { ShipmentNotFound } from "../../domain/errors/shipment-not-found.error.js";
import { toShipmentOutput } from "./mappers.adapter.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";
import type { ShipmentOutput } from "../dto/shipment-output.dto.js";

export class GetShipment {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(shipmentId: string): Promise<Result<ShipmentOutput, Error>> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Result.fail(ShipmentNotFound.create(shipmentId));
    }
    return Result.ok(toShipmentOutput(shipment));
  }
}
