import type { Profile } from "../../domain/entities/profile.entity.js";

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  findById(id: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
  delete(id: string): Promise<void>;
}
