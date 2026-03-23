import type { FeatureFlag } from "../../../domain/entities/feature-flag.entity.js";
import type { IFlagStore } from "../../ports/flag-store.port.js";

export class InMemoryFlagStore implements IFlagStore {
  private store = new Map<string, FeatureFlag>();

  async save(flag: FeatureFlag): Promise<void> {
    this.store.set(flag.key.value, flag);
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    return this.store.get(key) ?? null;
  }

  async findAll(): Promise<FeatureFlag[]> {
    return [...this.store.values()];
  }
}
