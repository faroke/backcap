import { Controller, Get, Query, Inject, HttpException } from "@nestjs/common";
import type { ISearchService } from "../../../../capabilities/search/contracts/search.contract.js";
import { InvalidQuery } from "../../../../capabilities/search/domain/errors/invalid-query.error.js";
import { IndexNotFound } from "../../../../capabilities/search/domain/errors/index-not-found.error.js";

function toHttpStatus(error: Error): number {
  if (error instanceof InvalidQuery) return 400;
  if (error instanceof IndexNotFound) return 404;
  return 500;
}

@Controller("search")
export class SearchController {
  constructor(@Inject("ISearchService") private readonly searchService: ISearchService) {}

  @Get()
  async search(@Query("q") query: string) {
    const result = await this.searchService.searchDocuments({
      indexName: "posts",
      query: query ?? "",
      page: 1,
      pageSize: 20,
    });
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }
}
