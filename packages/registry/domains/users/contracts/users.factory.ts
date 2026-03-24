import type { IProfileRepository } from "../application/ports/profile-repository.port.js";
import { CreateProfile } from "../application/use-cases/create-profile.use-case.js";
import { GetProfile } from "../application/use-cases/get-profile.use-case.js";
import { UpdateProfile } from "../application/use-cases/update-profile.use-case.js";
import { UpdatePreferences } from "../application/use-cases/update-preferences.use-case.js";
import { AddAddress } from "../application/use-cases/add-address.use-case.js";
import { RemoveAddress } from "../application/use-cases/remove-address.use-case.js";
import type { Profile } from "../domain/entities/profile.entity.js";
import type { IUsersService, UsersProfileOutput } from "./users.contract.js";

export type UsersServiceDeps = {
  profileRepository: IProfileRepository;
};

function toProfileOutput(profile: Profile): UsersProfileOutput {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName.value,
    avatarUrl: profile.avatarUrl?.value ?? null,
    bio: profile.bio,
    locale: profile.locale.value,
    timezone: profile.timezone.value,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    addresses: profile.addresses.map((a) => ({
      label: a.label,
      street: a.street,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
      ...(a.state !== undefined && { state: a.state }),
    })),
  };
}

export function createUsersService(deps: UsersServiceDeps): IUsersService {
  const createProfile = new CreateProfile(deps.profileRepository);
  const getProfile = new GetProfile(deps.profileRepository);
  const updateProfile = new UpdateProfile(deps.profileRepository);
  const updatePreferences = new UpdatePreferences(deps.profileRepository);
  const addAddress = new AddAddress(deps.profileRepository);
  const removeAddress = new RemoveAddress(deps.profileRepository);

  return {
    createProfile: (input) => createProfile.execute(input),
    getProfile: async (userId) => {
      const result = await getProfile.execute(userId);
      return result.map((profile) => toProfileOutput(profile));
    },
    updateProfile: async (input) => {
      const result = await updateProfile.execute(input);
      return result.map(({ profile }) => toProfileOutput(profile));
    },
    updatePreferences: async (input) => {
      const result = await updatePreferences.execute(input);
      return result.map(({ profile }) => toProfileOutput(profile));
    },
    addAddress: async (input) => {
      const result = await addAddress.execute(input);
      return result.map((profile) => toProfileOutput(profile));
    },
    removeAddress: async (input) => {
      const result = await removeAddress.execute(input);
      return result.map((profile) => toProfileOutput(profile));
    },
  };
}
