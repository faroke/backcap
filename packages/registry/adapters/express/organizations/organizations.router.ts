// Template: import type { IOrganizationService } from "{{cap_rel}}/organizations/contracts/index.js";
import type { IOrganizationService } from "../../../capabilities/organizations/contracts/index.js";
// Template: import { OrgNotFound } from "{{cap_rel}}/organizations/domain/errors/org-not-found.error.js";
import { OrgNotFound } from "../../../capabilities/organizations/domain/errors/org-not-found.error.js";
// Template: import { OrgSlugTaken } from "{{cap_rel}}/organizations/domain/errors/org-slug-taken.error.js";
import { OrgSlugTaken } from "../../../capabilities/organizations/domain/errors/org-slug-taken.error.js";
// Template: import { MemberAlreadyExists } from "{{cap_rel}}/organizations/domain/errors/member-already-exists.error.js";
import { MemberAlreadyExists } from "../../../capabilities/organizations/domain/errors/member-already-exists.error.js";
// Template: import { CannotRemoveOwner } from "{{cap_rel}}/organizations/domain/errors/cannot-remove-owner.error.js";
import { CannotRemoveOwner } from "../../../capabilities/organizations/domain/errors/cannot-remove-owner.error.js";

interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
  user?: { userId: string };
}

interface Response {
  status(code: number): Response;
  json(data: unknown): void;
}

type NextFunction = (err?: unknown) => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
interface Router {
  get(path: string, handler: RequestHandler): void;
  post(path: string, handler: RequestHandler): void;
  put(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof OrgNotFound) return { status: 404, message: error.message };
  if (error instanceof OrgSlugTaken) return { status: 409, message: error.message };
  if (error instanceof MemberAlreadyExists) return { status: 409, message: error.message };
  if (error instanceof CannotRemoveOwner) return { status: 403, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createOrganizationsRouter(
  orgService: IOrganizationService,
  router: Router,
): Router {
  router.post("/organizations", async (req: Request, res: Response) => {
    const { name, slug, ownerId, plan, settings } = req.body as {
      name: string;
      slug: string;
      ownerId: string;
      plan?: string;
      settings?: Record<string, unknown>;
    };
    if (!name || typeof name !== "string" || !slug || typeof slug !== "string" || !ownerId || typeof ownerId !== "string") {
      res.status(400).json({ error: "Missing required fields: name, slug, ownerId" });
      return;
    }
    const result = await orgService.createOrganization({ name, slug, ownerId, plan, settings });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.get("/organizations/:id", async (req: Request, res: Response) => {
    const result = await orgService.getOrganization(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.put("/organizations/:id", async (req: Request, res: Response) => {
    const { name, settings } = req.body as {
      name?: string;
      settings?: Record<string, unknown>;
    };
    const result = await orgService.updateOrganization({
      organizationId: req.params.id,
      name,
      settings,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.post("/organizations/:id/invitations", async (req: Request, res: Response) => {
    const { email, role, invitedBy } = req.body as {
      email: string;
      role: string;
      invitedBy: string;
    };
    if (!email || typeof email !== "string" || !role || typeof role !== "string" || !invitedBy || typeof invitedBy !== "string") {
      res.status(400).json({ error: "Missing required fields: email, role, invitedBy" });
      return;
    }
    const result = await orgService.inviteMember({
      organizationId: req.params.id,
      email,
      role,
      invitedBy,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.post("/invitations/accept", async (req: Request, res: Response) => {
    const { token, userId } = req.body as { token: string; userId: string };
    if (!token || typeof token !== "string" || !userId || typeof userId !== "string") {
      res.status(400).json({ error: "Missing required fields: token, userId" });
      return;
    }
    const result = await orgService.acceptInvitation({ token, userId });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.get("/organizations/:id/members", async (req: Request, res: Response) => {
    const result = await orgService.listMembers(req.params.id);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  router.delete("/organizations/:orgId/members/:userId", async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const result = await orgService.removeMember({
      organizationId: req.params.orgId,
      userId: req.params.userId,
      removedBy: req.user.userId,
    });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(204).json(undefined);
  });

  return router;
}
