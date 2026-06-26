import { Result } from "../../shared/result.js";
import type { Profile } from "../../domain/entities/profile.entity.js";
import { ProfileNotFound } from "../../domain/errors/profile-not-found.error.js";
import type { InvalidAddress } from "../../domain/errors/invalid-address.error.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { RemoveAddressInput } from "../dto/remove-address-input.dto.js";

export class RemoveAddress {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(
    input: RemoveAddressInput,
  ): Promise<Result<Profile, ProfileNotFound | InvalidAddress>> {
    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      return Result.fail(ProfileNotFound.create(input.userId));
    }

    const result = profile.removeAddress(input.label);
    if (result.isFail()) {
      return Result.fail(result.unwrapError());
    }

    const updated = result.unwrap();
    await this.profileRepository.save(updated);

    return Result.ok(updated);
  }
}
