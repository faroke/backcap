import { describe, it, expect, beforeEach, vi } from "vitest";
import { createOrganizationsRouter } from "../organizations.router.js";
import { Result } from "../../../../capabilities/organizations/shared/result.js";
import { OrgNotFound } from "../../../../capabilities/organizations/domain/errors/org-not-found.error.js";
import { OrgSlugTaken } from "../../../../capabilities/organizations/domain/errors/org-slug-taken.error.js";

function createMockRouter() {
  const routes: Record<string, Record<string, Function>> = {};
  return {
    get: vi.fn((path: string, handler: Function) => {
      routes[`GET:${path}`] = { handler };
    }),
    post: vi.fn((path: string, handler: Function) => {
      routes[`POST:${path}`] = { handler };
    }),
    put: vi.fn((path: string, handler: Function) => {
      routes[`PUT:${path}`] = { handler };
    }),
    delete: vi.fn((path: string, handler: Function) => {
      routes[`DELETE:${path}`] = { handler };
    }),
    _routes: routes,
  };
}

function createMockOrgService() {
  return {
    createOrganization: vi.fn(),
    getOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    inviteMember: vi.fn(),
    acceptInvitation: vi.fn(),
    removeMember: vi.fn(),
    listMembers: vi.fn(),
  };
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("Organizations router", () => {
  let router: ReturnType<typeof createMockRouter>;
  let orgService: ReturnType<typeof createMockOrgService>;

  beforeEach(() => {
    router = createMockRouter();
    orgService = createMockOrgService();
    createOrganizationsRouter(orgService, router as any);
  });

  it("registers all routes", () => {
    expect(router.post).toHaveBeenCalledWith("/organizations", expect.any(Function));
    expect(router.get).toHaveBeenCalledWith("/organizations/:id", expect.any(Function));
    expect(router.put).toHaveBeenCalledWith("/organizations/:id", expect.any(Function));
    expect(router.post).toHaveBeenCalledWith("/organizations/:id/invitations", expect.any(Function));
    expect(router.post).toHaveBeenCalledWith("/invitations/accept", expect.any(Function));
    expect(router.get).toHaveBeenCalledWith("/organizations/:id/members", expect.any(Function));
    expect(router.delete).toHaveBeenCalledWith("/organizations/:orgId/members/:userId", expect.any(Function));
  });

  it("POST /organizations - success returns 201", async () => {
    orgService.createOrganization.mockResolvedValue(
      Result.ok({ organizationId: "org-1" }),
    );
    const handler = router._routes["POST:/organizations"].handler;
    const res = mockRes();

    await handler(
      { body: { name: "Test", slug: "test", ownerId: "user-1" }, params: {} },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ organizationId: "org-1" });
  });

  it("POST /organizations - duplicate slug returns 409", async () => {
    orgService.createOrganization.mockResolvedValue(
      Result.fail(OrgSlugTaken.create("test")),
    );
    const handler = router._routes["POST:/organizations"].handler;
    const res = mockRes();

    await handler(
      { body: { name: "Test", slug: "test", ownerId: "user-1" }, params: {} },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("GET /organizations/:id - not found returns 404", async () => {
    orgService.getOrganization.mockResolvedValue(
      Result.fail(OrgNotFound.create("org-1")),
    );
    const handler = router._routes["GET:/organizations/:id"].handler;
    const res = mockRes();

    await handler({ body: {}, params: { id: "org-1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
