import { describe, it, expect, vi } from "vitest";
import { createAuthRouter } from "../auth.router.js";
import { Result } from "../../../../capabilities/auth/shared/result.js";
import { UserAlreadyExists } from "../../../../capabilities/auth/domain/errors/user-already-exists.error.js";
import { InvalidCredentials } from "../../../../capabilities/auth/domain/errors/invalid-credentials.error.js";

function createMockAuthService() {
  return {
    register: vi.fn(),
    login: vi.fn(),
  };
}

function createMockRouter() {
  const handlers = new Map<string, Function>();
  return {
    post: vi.fn((path: string, handler: Function) => handlers.set(path, handler)),
    getHandler: (path: string) => handlers.get(path)!,
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("auth.router", () => {
  it("POST /auth/register returns 201 on success", async () => {
    const authService = createMockAuthService();
    authService.register.mockResolvedValue(Result.ok({ userId: "user-1" }));
    const router = createMockRouter();
    createAuthRouter(authService, router as any);

    const handler = router.getHandler("/auth/register");
    const res = createMockRes();
    await handler({ body: { email: "a@b.com", password: "pass1234" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("POST /auth/register returns 409 on duplicate", async () => {
    const authService = createMockAuthService();
    authService.register.mockResolvedValue(Result.fail(UserAlreadyExists.create("a@b.com")));
    const router = createMockRouter();
    createAuthRouter(authService, router as any);

    const handler = router.getHandler("/auth/register");
    const res = createMockRes();
    await handler({ body: { email: "a@b.com", password: "pass1234" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("POST /auth/login returns 200 on success", async () => {
    const authService = createMockAuthService();
    authService.login.mockResolvedValue(Result.ok({ token: "tok", userId: "user-1" }));
    const router = createMockRouter();
    createAuthRouter(authService, router as any);

    const handler = router.getHandler("/auth/login");
    const res = createMockRes();
    await handler({ body: { email: "a@b.com", password: "pass1234" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "tok", userId: "user-1" });
  });

  it("POST /auth/login returns 401 on invalid credentials", async () => {
    const authService = createMockAuthService();
    authService.login.mockResolvedValue(Result.fail(InvalidCredentials.create()));
    const router = createMockRouter();
    createAuthRouter(authService, router as any);

    const handler = router.getHandler("/auth/login");
    const res = createMockRes();
    await handler({ body: { email: "a@b.com", password: "wrong" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
