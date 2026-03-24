import type { Shipment } from "../../domain/entities/shipment.entity.js";

export interface IShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByOrderId(orderId: string): Promise<Shipment[]>;
  findAll(): Promise<Shipment[]>;
  save(shipment: Shipment): Promise<void>;
  update(shipment: Shipment): Promise<void>;
}
