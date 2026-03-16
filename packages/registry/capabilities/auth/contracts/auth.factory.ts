import type { IUserRepository } from "../application/ports/user-repository.port.js";
import type { ITokenService } from "../application/ports/token-service.port.js";
import type { IPasswordHasher } from "../application/ports/password-hasher.port.js";
import { RegisterUser } from "../application/use-cases/register-user.use-case.js";
import { LoginUser } from "../application/use-cases/login-user.use-case.js";
import type { IAuthService } from "./auth.contract.js";

export type AuthServiceDeps = {
  userRepository: IUserRepository;
  tokenService: ITokenService;
  passwordHasher: IPasswordHasher;
};

export function createAuthService(deps: AuthServiceDeps): IAuthService {
  const registerUser = new RegisterUser(deps.userRepository, deps.passwordHasher);
  const loginUser = new LoginUser(deps.userRepository, deps.tokenService, deps.passwordHasher);
  return {
    register: (input) => registerUser.execute(input),
    login: (input) => loginUser.execute(input),
  };
}
