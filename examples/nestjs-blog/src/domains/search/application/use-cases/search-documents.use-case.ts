import { Result } from "../../shared/result.js";
import { SearchQuery } from "../../domain/value-objects/search-query.vo.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";
import type { ISearchEngine } from "../ports/search-engine.port.js";
import type { SearchDocumentsInput, SearchDocumentsOutput } from "../dto/search-documents.dto.js";

export class SearchDocuments {
  constructor(private readonly searchEngine: ISearchEngine) {}

  async execute(
    input: SearchDocumentsInput,
  ): Promise<Result<SearchDocumentsOutput, Error>> {
    const queryResult = SearchQuery.create({
      query: input.query,
      filters: input.filters,
      page: input.page,
      pageSize: input.pageSize,
    });

    if (queryResult.isFail()) {
      return Result.fail(queryResult.unwrapError());
    }

    const searchQuery = queryResult.unwrap();

    const exists = await this.searchEngine.indexExists(input.indexName);
    if (!exists) {
      return Result.fail(IndexNotFound.create(input.indexName));
    }

    const { hits, total } = await this.searchEngine.search({
      indexName: input.indexName,
      query: searchQuery.query,
      filters: searchQuery.filters,
      page: searchQuery.pagination.page,
      pageSize: searchQuery.pagination.pageSize,
    });

    return Result.ok({
      hits,
      total,
      page: searchQuery.pagination.page,
      pageSize: searchQuery.pagination.pageSize,
    });
  }
}
