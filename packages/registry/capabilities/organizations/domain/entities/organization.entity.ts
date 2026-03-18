// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { OrgSlug } from "../value-objects/org-slug.vo.js";

export class Organization {
  readonly id: string;
  readonly name: string;
  readonly slug: OrgSlug;
  readonly plan: string;
  readonly settings: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    slug: OrgSlug,
    plan: string,
    settings: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.plan = plan;
    this.settings = settings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    slug: string;
    plan?: string;
    settings?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Organization, Error> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(new Error("Organization name is required"));
    }

    const slugResult = OrgSlug.create(params.slug);
    if (slugResult.isFail()) {
      return Result.fail(slugResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new Organization(
        params.id,
        params.name.trim(),
        slugResult.unwrap(),
        params.plan ?? "free",
        params.settings ?? {},
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  updateName(newName: string): Result<Organization, Error> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new Error("Organization name is required"));
    }

    return Result.ok(
      new Organization(
        this.id,
        newName.trim(),
        this.slug,
        this.plan,
        this.settings,
        this.createdAt,
        new Date(),
      ),
    );
  }

  updateSettings(
    newSettings: Record<string, unknown>,
  ): Result<Organization, Error> {
    const merged = { ...this.settings, ...newSettings };
    const serialized = JSON.stringify(merged);
    if (serialized.length > 65_536) {
      return Result.fail(new Error("Organization settings exceed maximum size (64KB)"));
    }
    return Result.ok(new Organization(
      this.id,
      this.name,
      this.slug,
      this.plan,
      merged,
      this.createdAt,
      new Date(),
    ));
  }
}
