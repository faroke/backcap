import { Result } from "../../shared/result.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";
import { DocumentNotFound } from "../../domain/errors/document-not-found.error.js";
import type { ISearchEngine } from "../ports/search-engine.port.js";
import type { RemoveFromIndexInput, RemoveFromIndexOutput } from "../dto/remove-from-index.dto.js";

export class RemoveFromIndex {
  constructor(private readonly searchEngine: ISearchEngine) {}

  async execute(
    input: RemoveFromIndexInput,
  ): Promise<Result<RemoveFromIndexOutput, Error>> {
    const indexExists = await this.searchEngine.indexExists(input.indexName);
    if (!indexExists) {
      return Result.fail(IndexNotFound.create(input.indexName));
    }

    const docExists = await this.searchEngine.documentExists(
      input.indexName,
      input.documentId,
    );
    if (!docExists) {
      return Result.fail(DocumentNotFound.create(input.documentId));
    }

    await this.searchEngine.removeDocument(input.indexName, input.documentId);

    return Result.ok({
      documentId: input.documentId,
      removedAt: new Date(),
    });
  }
}
