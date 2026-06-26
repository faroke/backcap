import { Result } from "../../shared/result.js";
import type { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileNotFound } from "../../domain/errors/profile-not-found.error.js";
import { ProfileUpdated } from "../../domain/events/profile-updated.event.js";
import type { InvalidDisplayName } from "../../domain/errors/invalid-display-name.error.js";
import type { InvalidAvatarUrl } from "../../domain/errors/invalid-avatar-url.error.js";
import type { InvalidBio } from "../../domain/errors/invalid-bio.error.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { UpdateProfileInput } from "../dto/update-profile-input.dto.js";

export class UpdateProfile {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(
    input: UpdateProfileInput,
  ): Promise<
    Result<
      { profile: Profile; event: ProfileUpdated },
      ProfileNotFound | InvalidDisplayName | InvalidAvatarUrl | InvalidBio
    >
  > {
    let profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      return Result.fail(ProfileNotFound.create(input.userId));
    }

    const updatedFields: string[] = [];

    if (input.displayName !== undefined) {
      const result = profile.updateDisplayName(input.displayName);
      if (result.isFail()) {
        return Result.fail(result.unwrapError());
      }
      profile = result.unwrap();
      updatedFields.push("displayName");
    }

    if ("avatarUrl" in input && input.avatarUrl !== undefined) {
      const result = profile.updateAvatar(input.avatarUrl);
      if (result.isFail()) {
        return Result.fail(result.unwrapError());
      }
      profile = result.unwrap();
      updatedFields.push("avatarUrl");
    } else if ("avatarUrl" in input && input.avatarUrl === undefined) {
      // avatarUrl key present but undefined — treat as no change (skip)
    }

    if (input.bio !== undefined) {
      const result = profile.updateBio(input.bio);
      if (result.isFail()) {
        return Result.fail(result.unwrapError());
      }
      profile = result.unwrap();
      updatedFields.push("bio");
    }

    await this.profileRepository.save(profile);

    const event = new ProfileUpdated(
      profile.id,
      profile.userId,
      updatedFields,
    );

    return Result.ok({ profile, event });
  }
}
