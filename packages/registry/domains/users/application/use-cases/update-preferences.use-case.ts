import { Result } from "../../shared/result.js";
import type { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileNotFound } from "../../domain/errors/profile-not-found.error.js";
import { ProfileUpdated } from "../../domain/events/profile-updated.event.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { UpdatePreferencesInput } from "../dto/update-preferences-input.dto.js";

export class UpdatePreferences {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(
    input: UpdatePreferencesInput,
  ): Promise<Result<{ profile: Profile; event: ProfileUpdated }, Error>> {
    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      return Result.fail(ProfileNotFound.create(input.userId));
    }

    const result = profile.updatePreferences({
      locale: input.locale,
      timezone: input.timezone,
    });

    if (result.isFail()) {
      return Result.fail(result.unwrapError());
    }

    const updated = result.unwrap();
    await this.profileRepository.save(updated);

    const updatedFields: string[] = [];
    if (input.locale !== undefined) updatedFields.push("locale");
    if (input.timezone !== undefined) updatedFields.push("timezone");

    const event = new ProfileUpdated(updated.id, updated.userId, updatedFields);

    return Result.ok({ profile: updated, event });
  }
}
