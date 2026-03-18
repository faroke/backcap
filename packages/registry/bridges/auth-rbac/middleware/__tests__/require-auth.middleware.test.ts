import { describe, it, expect, vi } from "vitest";
import { requireAuth } from "../require-auth.middleware.js";

function createMockTokenService() {
  return {
    generate: vi.fn(),
    verify: vi.fn(),
  };
}

function createMockAuthorizationService() {
  return {
    createRole: vi.fn(),
    assignRole: vi.fn(),
    revokeRole: vi.fn(),
    checkPermission: vi.fn(),
    listRoles: vi.fn(),
    getUserPermissions: vi.fn(),
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("requireAuth middleware", () => {
  it("calls next() when token is valid and permission is granted", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });

    const authorizationService = createMockAuthorizationService();
    authorizationService.checkPermission.mockResolvedValue({
      isOk: () => true,
      isFail: () => false,
      unwrap: () => true,
    });

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts:create",
    });

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "user-1", organizationId: undefined });
    expect(tokenService.verify).toHaveBeenCalledWith("valid-token");
    expect(authorizationService.checkPermission).toHaveBeenCalledWith({
      userId: "user-1",
      action: "create",
      resource: "posts",
      organizationId: undefined,
    });
  });

  it("forwards organizationId from token to req.user and checkPermission", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1", organizationId: "org-42" });

    const authorizationService = createMockAuthorizationService();
    authorizationService.checkPermission.mockResolvedValue({
      isOk: () => true,
      isFail: () => false,
      unwrap: () => true,
    });

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts:create",
    });

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "user-1", organizationId: "org-42" });
    expect(authorizationService.checkPermission).toHaveBeenCalledWith({
      userId: "user-1",
      action: "create",
      resource: "posts",
      organizationId: "org-42",
    });
  });

  it("returns 400 on malformed permission string (no colon)", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });

    const authorizationService = createMockAuthorizationService();

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts",
    });

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(authorizationService.checkPermission).not.toHaveBeenCalled();
  });

  it("returns 401 when token is missing", async () => {
    const tokenService = createMockTokenService();
    const authorizationService = createMockAuthorizationService();

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts:create",
    });

    const req: any = { headers: {} };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when token is invalid", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue(null);

    const authorizationService = createMockAuthorizationService();

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts:create",
    });

    const req: any = { headers: { authorization: "Bearer invalid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(authorizationService.checkPermission).not.toHaveBeenCalled();
  });

  it("returns 403 when token is valid but permission is denied", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });

    const authorizationService = createMockAuthorizationService();
    authorizationService.checkPermission.mockResolvedValue({
      isOk: () => false,
      isFail: () => true,
      unwrapError: () => ({ message: 'User "user-1" does not have permission to "create" on "posts"' }),
    });

    const middleware = requireAuth(tokenService, authorizationService, {
      permission: "posts:create",
    });

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("works without permission option (auth-only mode)", async () => {
    const tokenService = createMockTokenService();
    tokenService.verify.mockResolvedValue({ userId: "user-1" });

    const authorizationService = createMockAuthorizationService();

    const middleware = requireAuth(tokenService, authorizationService);

    const req: any = { headers: { authorization: "Bearer valid-token" } };
    const res = createMockRes();
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "user-1", organizationId: undefined });
    expect(authorizationService.checkPermission).not.toHaveBeenCalled();
  });
});
