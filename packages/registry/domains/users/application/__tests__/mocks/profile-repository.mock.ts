import type { Profile } from "../../../domain/entities/profile.entity.js";
import type { IProfileRepository } from "../../ports/profile-repository.port.js";

export class InMemoryProfileRepository implements IProfileRepository {
  private store = new Map<string, Profile>();

  async findByUserId(userId: string): Promise<Profile | null> {
    return [...this.store.values()].find((p) => p.userId === userId) ?? null;
  }

  async findById(id: string): Promise<Profile | null> {
    return this.store.get(id) ?? null;
  }

  async save(profile: Profile): Promise<void> {
    this.store.set(profile.id, profile);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
