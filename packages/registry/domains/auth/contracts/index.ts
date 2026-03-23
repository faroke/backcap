export type {
  AuthRegisterInput,
  AuthLoginInput,
  AuthLoginOutput,
  IAuthService,
} from "./auth.contract.js";

export { createAuthService } from "./auth.factory.js";
export type { AuthServiceDeps } from "./auth.factory.js";
