import { Result } from "../../shared/result.js";
import { OrgSlug } from "../value-objects/org-slug.vo.js";
import { InvalidOrgSlug } from "../errors/invalid-org-slug.error.js";
import { InvalidOrganizationName } from "../errors/invalid-organization-name.error.js";
import { OrganizationSettingsTooLarge } from "../errors/organization-settings-too-large.error.js";

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
    plan?: string | undefined;
    settings?: Record<string, unknown> | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
  }): Result<Organization, InvalidOrganizationName | InvalidOrgSlug> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(InvalidOrganizationName.create());
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

  updateName(newName: string): Result<Organization, InvalidOrganizationName> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(InvalidOrganizationName.create());
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
  ): Result<Organization, OrganizationSettingsTooLarge> {
    const merged = { ...this.settings, ...newSettings };
    const serialized = JSON.stringify(merged);
    if (serialized.length > 65_536) {
      return Result.fail(OrganizationSettingsTooLarge.create());
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
