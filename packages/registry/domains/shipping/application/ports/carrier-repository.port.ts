import type { Carrier } from "../../domain/entities/carrier.entity.js";

export interface ICarrierRepository {
  findById(id: string): Promise<Carrier | null>;
  findByCode(code: string): Promise<Carrier | null>;
  findAll(): Promise<Carrier[]>;
  save(carrier: Carrier): Promise<void>;
}
