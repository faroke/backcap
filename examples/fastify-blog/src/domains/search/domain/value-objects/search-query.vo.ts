import { Result } from "../../shared/result.js";
import { InvalidQuery } from "../errors/invalid-query.error.js";

const MAX_PAGE_SIZE = 100;

export interface SearchQueryPagination {
  page: number;
  pageSize: number;
}

export class SearchQuery {
  readonly query: string;
  readonly filters: Record<string, string | string[]> | undefined;
  readonly pagination: SearchQueryPagination;

  private constructor(
    query: string,
    filters: Record<string, string | string[]> | undefined,
    pagination: SearchQueryPagination,
  ) {
    this.query = query;
    this.filters = filters;
    this.pagination = pagination;
  }

  static create(params: {
    query: string;
    filters?: Record<string, string | string[]>;
    page?: number;
    pageSize?: number;
  }): Result<SearchQuery, InvalidQuery> {
    const trimmed = params.query.trim();
    if (trimmed.length === 0) {
      return Result.fail(InvalidQuery.create("query must not be empty"));
    }

    const page = params.page ?? 1;
    if (page < 1) {
      return Result.fail(InvalidQuery.create("page must be at least 1"));
    }

    const rawPageSize = params.pageSize ?? 10;
    const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);

    return Result.ok(
      new SearchQuery(trimmed, params.filters, { page, pageSize }),
    );
  }
}
