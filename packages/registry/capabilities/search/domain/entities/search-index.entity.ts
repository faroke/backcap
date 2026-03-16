import { Result } from "../../shared/result.js";

export class SearchIndex {
  readonly id: string;
  readonly name: string;
  readonly documentCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    documentCount: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.documentCount = documentCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    id: string;
    name: string;
    documentCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<SearchIndex, Error> {
    const trimmedName = params.name.trim();
    if (trimmedName.length === 0) {
      return Result.fail(new Error("Index name must not be empty"));
    }

    const documentCount = params.documentCount ?? 0;
    if (documentCount < 0) {
      return Result.fail(new Error("Document count must not be negative"));
    }

    const now = new Date();
    return Result.ok(
      new SearchIndex(
        params.id,
        trimmedName,
        documentCount,
        params.createdAt ?? now,
        params.updatedAt ?? now,
      ),
    );
  }

  incrementCount(): SearchIndex {
    return new SearchIndex(
      this.id,
      this.name,
      this.documentCount + 1,
      this.createdAt,
      new Date(),
    );
  }

  decrementCount(): SearchIndex {
    const newCount = Math.max(0, this.documentCount - 1);
    return new SearchIndex(
      this.id,
      this.name,
      newCount,
      this.createdAt,
      new Date(),
    );
  }
}
