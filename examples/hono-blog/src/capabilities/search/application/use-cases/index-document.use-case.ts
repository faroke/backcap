import { Result } from "../../shared/result.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";
import type { ISearchEngine } from "../ports/search-engine.port.js";
import type { IndexDocumentInput, IndexDocumentOutput } from "../dto/index-document.dto.js";

export class IndexDocument {
  constructor(private readonly searchEngine: ISearchEngine) {}

  async execute(
    input: IndexDocumentInput,
  ): Promise<Result<IndexDocumentOutput, Error>> {
    const exists = await this.searchEngine.indexExists(input.indexName);
    if (!exists) {
      return Result.fail(IndexNotFound.create(input.indexName));
    }

    await this.searchEngine.indexDocument(
      input.indexName,
      input.documentId,
      input.document,
    );

    return Result.ok({
      documentId: input.documentId,
      indexedAt: new Date(),
    });
  }
}
