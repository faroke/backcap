import type { FeatureFlag } from "../../domain/entities/feature-flag.entity.js";

export interface IFlagStore {
  save(flag: FeatureFlag): Promise<void>;
  findByKey(key: string): Promise<FeatureFlag | null>;
  findAll(): Promise<FeatureFlag[]>;
}
