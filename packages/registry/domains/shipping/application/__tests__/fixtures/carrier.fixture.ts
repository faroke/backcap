import { Carrier } from "../../../domain/entities/carrier.entity.js";
import type { ShippingZone } from "../../../domain/value-objects/shipping-zone.vo.js";

export function createTestCarrier(
  overrides?: Partial<{ id: string; name: string; code: string; supportedZones: ShippingZone[]; active: boolean }>,
): Carrier {
  const result = Carrier.create({
    id: overrides?.id ?? "carrier-1",
    name: overrides?.name ?? "Test Carrier",
    code: overrides?.code ?? "test-carrier",
    supportedZones: overrides?.supportedZones ?? [],
    active: overrides?.active ?? true,
  });
  if (result.isFail()) {
    throw new Error(`Failed to create test carrier: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
