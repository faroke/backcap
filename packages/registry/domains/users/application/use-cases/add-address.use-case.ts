import { Result } from "../../shared/result.js";
import type { Profile } from "../../domain/entities/profile.entity.js";
import { Address } from "../../domain/value-objects/address.vo.js";
import { ProfileNotFound } from "../../domain/errors/profile-not-found.error.js";
import type { IProfileRepository } from "../ports/profile-repository.port.js";
import type { AddAddressInput } from "../dto/add-address-input.dto.js";

export class AddAddress {
  constructor(private readonly profileRepository: IProfileRepository) {}

  async execute(input: AddAddressInput): Promise<Result<Profile, Error>> {
    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      return Result.fail(ProfileNotFound.create(input.userId));
    }

    const addressResult = Address.create({
      label: input.label,
      street: input.street,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      state: input.state,
    });

    if (addressResult.isFail()) {
      return Result.fail(addressResult.unwrapError());
    }

    const result = profile.addAddress(addressResult.unwrap());
    if (result.isFail()) {
      return Result.fail(result.unwrapError());
    }

    const updated = result.unwrap();
    await this.profileRepository.save(updated);

    return Result.ok(updated);
  }
}
