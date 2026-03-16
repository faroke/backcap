// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { TagSlug } from "../value-objects/tag-slug.vo.js";

export class Tag {
  readonly id: string;
  readonly name: string;
  readonly slug: TagSlug;
  readonly createdAt: Date;

  private constructor(
    id: string,
    name: string,
    slug: TagSlug,
    createdAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    name: string;
    slug: string;
    createdAt?: Date;
  }): Result<Tag, Error> {
    const slugResult = TagSlug.create(params.slug);
    if (slugResult.isFail()) {
      return Result.fail(slugResult.unwrapError());
    }

    return Result.ok(
      new Tag(
        params.id,
        params.name,
        slugResult.unwrap(),
        params.createdAt ?? new Date(),
      ),
    );
  }
}
