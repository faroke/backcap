import { Result } from "../../shared/result.js";
import { toShipmentOutput } from "./mappers.adapter.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";
import type { ShipmentOutput } from "../dto/shipment-output.dto.js";

export class ListShipments {
  constructor(private readonly shipmentRepository: IShipmentRepository) {}

  async execute(): Promise<Result<ShipmentOutput[], never>> {
    const shipments = await this.shipmentRepository.findAll();
    return Result.ok(shipments.map(toShipmentOutput));
  }
}
