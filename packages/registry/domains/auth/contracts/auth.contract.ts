import type { Result } from "../shared/result.js";
import type { UserAlreadyExists } from "../domain/errors/user-already-exists.error.js";
import type { InvalidEmail } from "../domain/errors/invalid-email.error.js";
import type { UserNotFound } from "../domain/errors/user-not-found.error.js";
import type { InvalidCredentials } from "../domain/errors/invalid-credentials.error.js";

export interface AuthRegisterInput {
  email: string;
  password: string;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthLoginOutput {
  token: string;
  userId: string;
}

export interface IAuthService {
  register(
    input: AuthRegisterInput,
  ): Promise<Result<{ userId: string }, UserAlreadyExists | InvalidEmail>>;
  login(
    input: AuthLoginInput,
  ): Promise<Result<AuthLoginOutput, UserNotFound | InvalidCredentials>>;
}
