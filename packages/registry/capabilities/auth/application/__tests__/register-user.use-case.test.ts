import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUser } from "../use-cases/register-user.use-case.js";
import { InMemoryUserRepository } from "./mocks/user-repository.mock.js";
import { InMemoryPasswordHasher } from "./mocks/password-hasher.mock.js";
import { createTestUser } from "./fixtures/user.fixture.js";
import { UserAlreadyExists } from "../../domain/errors/user-already-exists.error.js";
import { InvalidEmail } from "../../domain/errors/invalid-email.error.js";

describe("RegisterUser use case", () => {
  let userRepo: InMemoryUserRepository;
  let passwordHasher: InMemoryPasswordHasher;
  let registerUser: RegisterUser;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    passwordHasher = new InMemoryPasswordHasher();
    registerUser = new RegisterUser(userRepo, passwordHasher);
  });

  it("registers a new user successfully", async () => {
    const result = await registerUser.execute({
      email: "new@example.com",
      password: "password123",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.userId).toBeDefined();
    expect(output.event.email).toBe("new@example.com");
    expect(output.event.userId).toBe(output.userId);

    // Verify user was persisted
    const saved = await userRepo.findByEmail("new@example.com");
    expect(saved).not.toBeNull();
    expect(saved!.passwordHash).toBe("hashed:password123");
  });

  it("rejects duplicate email", async () => {
    const existing = createTestUser({ email: "taken@example.com" });
    await userRepo.save(existing);

    const result = await registerUser.execute({
      email: "taken@example.com",
      password: "password123",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UserAlreadyExists);
  });

  it("rejects invalid email format", async () => {
    const result = await registerUser.execute({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidEmail);
  });
});
