import { Result } from "../../shared/result.js";
import { User } from "../../domain/entities/user.entity.js";
import { UserRegistered } from "../../domain/events/user-registered.event.js";
import { UserAlreadyExists } from "../../domain/errors/user-already-exists.error.js";
import type { IUserRepository } from "../ports/user-repository.port.js";
import type { IPasswordHasher } from "../ports/password-hasher.port.js";
import type { RegisterInput } from "../dto/register-input.dto.js";

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    input: RegisterInput,
  ): Promise<Result<{ userId: string; event: UserRegistered }, Error>> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      return Result.fail(UserAlreadyExists.create(input.email));
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const id = crypto.randomUUID();
    const userResult = User.create({
      id,
      email: input.email,
      passwordHash,
    });

    if (userResult.isFail()) {
      return Result.fail(userResult.unwrapError());
    }

    const user = userResult.unwrap();
    await this.userRepository.save(user);

    const event = new UserRegistered(user.id, user.email.value);

    return Result.ok({ userId: user.id, event });
  }
}
