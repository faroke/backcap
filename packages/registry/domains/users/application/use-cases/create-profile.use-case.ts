import { Result } from "../../shared/result.js";
import { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileCreated } from "../../domain/events/profile-created.event.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { CreateProfileInput } from "../dto/create-profile-input.dto.js";

export class CreateProfile {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(
    input: CreateProfileInput,
  ): Promise<Result<{ profileId: string; event: ProfileCreated }, Error>> {
    const existing = await this.profileRepository.findByUserId(input.userId);
    if (existing) {
      return Result.fail(
        new Error("Profile already exists for user"),
      );
    }

    const id = crypto.randomUUID();
    const profileResult = Profile.create({
      id,
      userId: input.userId,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      bio: input.bio,
      locale: input.locale,
      timezone: input.timezone,
    });

    if (profileResult.isFail()) {
      return Result.fail(profileResult.unwrapError());
    }

    const profile = profileResult.unwrap();
    await this.profileRepository.save(profile);

    const event = new ProfileCreated(
      profile.id,
      profile.userId,
      profile.displayName.value,
    );

    return Result.ok({ profileId: profile.id, event });
  }
}
