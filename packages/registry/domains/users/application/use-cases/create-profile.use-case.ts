import { Result } from "../../shared/result.js";
import { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileCreated } from "../../domain/events/profile-created.event.js";
import { ProfileAlreadyExists } from "../../domain/errors/profile-already-exists.error.js";
import type { InvalidDisplayName } from "../../domain/errors/invalid-display-name.error.js";
import type { InvalidAvatarUrl } from "../../domain/errors/invalid-avatar-url.error.js";
import type { InvalidBio } from "../../domain/errors/invalid-bio.error.js";
import type { InvalidLocale } from "../../domain/errors/invalid-locale.error.js";
import type { InvalidTimezone } from "../../domain/errors/invalid-timezone.error.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { CreateProfileInput } from "../dto/create-profile-input.dto.js";

export class CreateProfile {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(
    input: CreateProfileInput,
  ): Promise<
    Result<
      { profileId: string; event: ProfileCreated },
      | ProfileAlreadyExists
      | InvalidDisplayName
      | InvalidAvatarUrl
      | InvalidBio
      | InvalidLocale
      | InvalidTimezone
    >
  > {
    const existing = await this.profileRepository.findByUserId(input.userId);
    if (existing) {
      return Result.fail(ProfileAlreadyExists.create(input.userId));
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
