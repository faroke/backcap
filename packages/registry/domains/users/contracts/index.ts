export type {
  UsersCreateProfileInput,
  UsersUpdateProfileInput,
  UsersUpdatePreferencesInput,
  UsersAddAddressInput,
  UsersRemoveAddressInput,
  UsersProfileOutput,
  IUsersService,
} from "./users.contract.js";

export { createUsersService } from "./users.factory.js";
export type { UsersServiceDeps } from "./users.factory.js";
