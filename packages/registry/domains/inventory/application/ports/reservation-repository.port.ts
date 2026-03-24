import type { Reservation } from "../../domain/entities/reservation.entity.js";

export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findByReference(referenceId: string, referenceType: string): Promise<Reservation[]>;
  findPendingBySku(sku: string, warehouseId: string): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<void>;
  update(reservation: Reservation): Promise<void>;
}
