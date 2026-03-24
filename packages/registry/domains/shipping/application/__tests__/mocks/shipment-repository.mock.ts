import type { IShipmentRepository } from "../../ports/shipment-repository.port.js";
import type { Shipment } from "../../../domain/entities/shipment.entity.js";

export class InMemoryShipmentRepository implements IShipmentRepository {
  private store = new Map<string, Shipment>();

  async findById(id: string): Promise<Shipment | null> {
    return this.store.get(id) ?? null;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    return [...this.store.values()].filter((s) => s.orderId === orderId);
  }

  async findAll(): Promise<Shipment[]> {
    return [...this.store.values()];
  }

  async save(shipment: Shipment): Promise<void> {
    this.store.set(shipment.id, shipment);
  }

  async update(shipment: Shipment): Promise<void> {
    this.store.set(shipment.id, shipment);
  }
}
