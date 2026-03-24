import type { Reservation } from "../../../domain/entities/reservation.entity.js";
import type { IReservationRepository } from "../../ports/reservation-repository.port.js";

export class InMemoryReservationRepository implements IReservationRepository {
  private store = new Map<string, Reservation>();

  async findById(id: string): Promise<Reservation | null> {
    return this.store.get(id) ?? null;
  }

  async findByReference(referenceId: string, referenceType: string): Promise<Reservation[]> {
    return [...this.store.values()].filter(
      (r) => r.referenceId === referenceId && r.referenceType === referenceType,
    );
  }

  async findPendingBySku(sku: string, warehouseId: string): Promise<Reservation[]> {
    return [...this.store.values()].filter(
      (r) => r.sku === sku && r.warehouseId.value === warehouseId && r.status.isPending(),
    );
  }

  async save(reservation: Reservation): Promise<void> {
    this.store.set(reservation.id, reservation);
  }

  async update(reservation: Reservation): Promise<void> {
    this.store.set(reservation.id, reservation);
  }
}
