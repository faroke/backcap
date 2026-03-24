import { Reservation } from "../../../domain/entities/reservation.entity.js";

export function createTestReservation(
  overrides?: Partial<{
    id: string;
    sku: string;
    warehouseId: string;
    quantity: number;
    referenceId: string;
    referenceType: string;
    expiresAt: Date;
    status: string;
  }>,
): Reservation {
  const result = Reservation.create({
    id: overrides?.id ?? "res-1",
    sku: overrides?.sku ?? "SKU-001",
    warehouseId: overrides?.warehouseId ?? "warehouse-main",
    quantity: overrides?.quantity ?? 5,
    referenceId: overrides?.referenceId ?? "order-1",
    referenceType: overrides?.referenceType ?? "order",
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000),
    status: overrides?.status,
    createdAt: overrides?.status ? new Date(Date.now() - 60 * 60 * 1000) : undefined,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test reservation: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
