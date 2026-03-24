import { Result } from "../../../shared/result.js";
import { Shipment } from "../../domain/entities/shipment.entity.js";
import { ShippingZone } from "../../domain/value-objects/shipping-zone.vo.js";
import { CarrierNotFound } from "../../domain/errors/carrier-not-found.error.js";
import { ShipmentCreated } from "../../domain/events/shipment-created.event.js";
import type { IShipmentRepository } from "../ports/shipment-repository.port.js";
import type { ICarrierRepository } from "../ports/carrier-repository.port.js";
import type { CreateShipmentInput } from "../dto/create-shipment-input.dto.js";

export class CreateShipment {
  constructor(
    private readonly shipmentRepository: IShipmentRepository,
    private readonly carrierRepository: ICarrierRepository,
  ) {}

  async execute(input: CreateShipmentInput): Promise<Result<{ shipmentId: string; event: ShipmentCreated }, Error>> {
    const carrier = await this.carrierRepository.findById(input.carrierId);
    if (!carrier) {
      return Result.fail(CarrierNotFound.create(input.carrierId));
    }
    if (!carrier.active) {
      return Result.fail(new Error(`Carrier "${input.carrierId}" is not active`));
    }

    const zoneResult = ShippingZone.create({
      originCountry: input.originCountry,
      destinationCountry: input.destinationCountry,
    });
    if (zoneResult.isFail()) {
      return Result.fail(zoneResult.unwrapError());
    }

    const shipmentId = crypto.randomUUID();
    const shipmentResult = Shipment.create({
      id: shipmentId,
      orderId: input.orderId,
      carrierId: input.carrierId,
      zone: zoneResult.unwrap(),
      weightGrams: input.weightGrams,
    });
    if (shipmentResult.isFail()) {
      return Result.fail(shipmentResult.unwrapError());
    }

    const shipment = shipmentResult.unwrap();
    await this.shipmentRepository.save(shipment);

    const event = new ShipmentCreated(shipment.id, shipment.orderId, shipment.carrierId);
    return Result.ok({ shipmentId: shipment.id, event });
  }
}
