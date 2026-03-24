import type { ICarrierRepository } from "../../ports/carrier-repository.port.js";
import type { Carrier } from "../../../domain/entities/carrier.entity.js";

export class InMemoryCarrierRepository implements ICarrierRepository {
  private store = new Map<string, Carrier>();

  async findById(id: string): Promise<Carrier | null> {
    return this.store.get(id) ?? null;
  }

  async findByCode(code: string): Promise<Carrier | null> {
    return [...this.store.values()].find((c) => c.code === code) ?? null;
  }

  async findAll(): Promise<Carrier[]> {
    return [...this.store.values()];
  }

  async save(carrier: Carrier): Promise<void> {
    this.store.set(carrier.id, carrier);
  }
}
