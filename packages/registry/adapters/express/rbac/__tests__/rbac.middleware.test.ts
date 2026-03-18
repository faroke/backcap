import { describe, it, expect, vi } from "vitest";
import { requirePermission } from "../rbac.middleware.js";
import { Result } from "../../../../capabilities/rbac/shared/result.js";
import { PermissionDenied } from "../../../../capabilities/rbac/domain/errors/permission-denied.error.js";

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

describe("requirePermission middleware", () => {
  it("calls next() when user has permission", async () => {
    const service = createMockAuthorizationService();
    service.checkPermission.mockResolvedValue(Result.ok(true));
    const middleware = requirePermission(service, "posts", "create");

    const next = vi.fn();
    const res = createMockRes();
    await middleware({ user: { userId: "user-1" } }, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 when user lacks permission", async () => {
    const service = createMockAuthorizationService();
    service.checkPermission.mockResolvedValue(
      Result.fail(PermissionDenied.create("user-1", "create", "posts")),
    );
    const middleware = requirePermission(service, "posts", "create");

    const next = vi.fn();
    const res = createMockRes();
    await middleware({ user: { userId: "user-1" } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 401 when no user on request", async () => {
    const service = createMockAuthorizationService();
    const middleware = requirePermission(service, "posts", "create");

    const next = vi.fn();
    const res = createMockRes();
    await middleware({}, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
