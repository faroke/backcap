import { describe, it, expect, beforeEach } from "vitest";
import { LoginUser } from "../use-cases/login-user.use-case.js";
import { InMemoryUserRepository } from "./mocks/user-repository.mock.js";
import { InMemoryTokenService } from "./mocks/token-service.mock.js";
import { InMemoryPasswordHasher } from "./mocks/password-hasher.mock.js";
import { createTestUser } from "./fixtures/user.fixture.js";
import { UserNotFound } from "../../domain/errors/user-not-found.error.js";
import { InvalidCredentials } from "../../domain/errors/invalid-credentials.error.js";

describe("LoginUser use case", () => {
  let userRepo: InMemoryUserRepository;
  let tokenService: InMemoryTokenService;
  let passwordHasher: InMemoryPasswordHasher;
  let loginUser: LoginUser;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    tokenService = new InMemoryTokenService();
    passwordHasher = new InMemoryPasswordHasher();
    loginUser = new LoginUser(userRepo, tokenService, passwordHasher);

    // Seed a user with hashed password
    const user = createTestUser({
      email: "user@example.com",
      passwordHash: "hashed:correct-password",
    });
    await userRepo.save(user);
  });

  it("logs in with valid credentials", async () => {
    const result = await loginUser.execute({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.token).toBeDefined();
    expect(output.token).toContain("token-");
    expect(output.userId).toBe("test-user-1");
  });

  it("passes organizationId to token service when provided", async () => {
    const result = await loginUser.execute({
      email: "user@example.com",
      password: "correct-password",
      organizationId: "org-123",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.token).toBeDefined();
    expect(output.userId).toBe("test-user-1");

    // Verify the token actually contains the organizationId
    const payload = await tokenService.verify(output.token);
    expect(payload).not.toBeNull();
    expect(payload!.organizationId).toBe("org-123");
  });

  it("rejects unknown email", async () => {
    const result = await loginUser.execute({
      email: "unknown@example.com",
      password: "any-password",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UserNotFound);
  });

  it("rejects wrong password", async () => {
    const result = await loginUser.execute({
      email: "user@example.com",
      password: "wrong-password",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidCredentials);
  });
});
