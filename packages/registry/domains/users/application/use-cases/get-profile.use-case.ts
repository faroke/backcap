import { Result } from "../../shared/result.js";
import type { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileNotFound } from "../../domain/errors/profile-not-found.error.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";

export class GetProfile {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(userId: string): Promise<Result<Profile, Error>> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      return Result.fail(ProfileNotFound.create(userId));
    }
    return Result.ok(profile);
  }
}
