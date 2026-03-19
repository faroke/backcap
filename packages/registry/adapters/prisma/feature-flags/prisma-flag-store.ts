// Template: import type { IFlagStore } from "{{cap_rel}}/feature-flags/application/ports/flag-store.port.js";
import type { IFlagStore } from "../../../capabilities/feature-flags/application/ports/flag-store.port.js";
// Template: import { FeatureFlag } from "{{cap_rel}}/feature-flags/domain/entities/feature-flag.entity.js";
import { FeatureFlag } from "../../../capabilities/feature-flags/domain/entities/feature-flag.entity.js";

interface FeatureFlagRecord {
  id: string;
  key: string;
  isEnabled: boolean;
  conditions: unknown | null;
  createdAt: Date;
}

interface PrismaFeatureFlagDelegate {
  findUnique(args: {
    where: { key?: string; id?: string };
  }): Promise<FeatureFlagRecord | null>;
  findMany(): Promise<FeatureFlagRecord[]>;
  upsert(args: {
    where: { key: string };
    create: FeatureFlagRecord;
    update: Omit<FeatureFlagRecord, "id">;
  }): Promise<FeatureFlagRecord>;
}

interface PrismaClient {
  featureFlagRecord: PrismaFeatureFlagDelegate;
}

export class PrismaFlagStore implements IFlagStore {
  constructor(private readonly prisma: PrismaClient) {}

  async save(flag: FeatureFlag): Promise<void> {
    const data = this.toPrisma(flag);
    await this.prisma.featureFlagRecord.upsert({
      where: { key: data.key },
      create: data,
      update: {
        key: data.key,
        isEnabled: data.isEnabled,
        conditions: data.conditions,
        createdAt: data.createdAt,
      },
    });
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const record = await this.prisma.featureFlagRecord.findUnique({
      where: { key },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<FeatureFlag[]> {
    const records = await this.prisma.featureFlagRecord.findMany();
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: FeatureFlagRecord): FeatureFlag {
    const result = FeatureFlag.create({
      id: record.id,
      key: record.key,
      isEnabled: record.isEnabled,
      conditions: record.conditions as Record<string, unknown> | undefined,
      createdAt: record.createdAt,
    });
    if (result.isFail()) {
      throw new Error(
        `Corrupted FeatureFlagRecord in database (key="${record.key}"): ${result.unwrapError().message}`,
      );
    }
    return result.unwrap();
  }

  private toPrisma(flag: FeatureFlag): FeatureFlagRecord {
    return {
      id: flag.id,
      key: flag.key.value,
      isEnabled: flag.isEnabled,
      conditions: flag.conditions ?? null,
      createdAt: flag.createdAt,
    };
  }
}
