import { Result } from "../../shared/result.js";
import { UserNotFound } from "../../domain/errors/user-not-found.error.js";
import { InvalidCredentials } from "../../domain/errors/invalid-credentials.error.js";
import type { IUserRepository } from "../ports/user-repository.port.js";
import type { ITokenService } from "../ports/token-service.port.js";
import type { IPasswordHasher } from "../ports/password-hasher.port.js";
import type { LoginInput } from "../dto/login-input.dto.js";
import type { LoginOutput } from "../dto/login-output.dto.js";

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput, Error>> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return Result.fail(UserNotFound.create(input.email));
    }

    const isValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!isValid) {
      return Result.fail(InvalidCredentials.create());
    }

    const token = await this.tokenService.generate(user.id, user.roles, input.organizationId || undefined);

    return Result.ok({ token, userId: user.id });
  }
}
