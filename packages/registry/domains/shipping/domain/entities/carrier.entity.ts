import { Result } from "../../shared/result.js";
import { ShippingZone } from "../value-objects/shipping-zone.vo.js";
import { InvalidCarrier } from "../errors/invalid-carrier.error.js";

export class Carrier {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly supportedZones: readonly ShippingZone[];
  readonly active: boolean;
  readonly createdAt: Date;

  private constructor(
    id: string,
    name: string,
    code: string,
    supportedZones: readonly ShippingZone[],
    active: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.supportedZones = supportedZones;
    this.active = active;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    name: string;
    code: string;
    supportedZones?: ShippingZone[];
    active?: boolean;
    createdAt?: Date;
  }): Result<Carrier, InvalidCarrier> {
    if (!params.id || params.id.trim().length === 0) {
      return Result.fail(InvalidCarrier.missingId());
    }
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(InvalidCarrier.missingName());
    }
    if (!params.code || params.code.trim().length === 0) {
      return Result.fail(InvalidCarrier.missingCode());
    }
    if (!/^[a-z0-9-]+$/.test(params.code)) {
      return Result.fail(InvalidCarrier.invalidCode(params.code));
    }

    return Result.ok(
      new Carrier(
        params.id,
        params.name,
        params.code,
        params.supportedZones ?? [],
        params.active ?? true,
        params.createdAt ?? new Date(),
      ),
    );
  }

  supportsZone(zone: ShippingZone): boolean {
    return this.supportedZones.some((z) => z.equals(zone));
  }

  deactivate(): Carrier {
    return new Carrier(this.id, this.name, this.code, this.supportedZones, false, this.createdAt);
  }

  activate(): Carrier {
    return new Carrier(this.id, this.name, this.code, this.supportedZones, true, this.createdAt);
  }
}
