import type { Result } from "../shared/result.js";

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
  register(input: AuthRegisterInput): Promise<Result<{ userId: string }, Error>>;
  login(input: AuthLoginInput): Promise<Result<AuthLoginOutput, Error>>;
}
