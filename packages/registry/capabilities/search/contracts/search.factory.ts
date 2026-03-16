import type { ISearchEngine } from "../application/ports/search-engine.port.js";
import { IndexDocument } from "../application/use-cases/index-document.use-case.js";
import { SearchDocuments } from "../application/use-cases/search-documents.use-case.js";
import { RemoveFromIndex } from "../application/use-cases/remove-from-index.use-case.js";
import type { ISearchService } from "./search.contract.js";

export type SearchServiceDeps = {
  searchEngine: ISearchEngine;
};

export function createSearchService(deps: SearchServiceDeps): ISearchService {
  const indexDocument = new IndexDocument(deps.searchEngine);
  const searchDocuments = new SearchDocuments(deps.searchEngine);
  const removeFromIndex = new RemoveFromIndex(deps.searchEngine);

  return {
    indexDocument: (input) => indexDocument.execute(input),
    searchDocuments: (input) => searchDocuments.execute(input),
    removeFromIndex: (input) => removeFromIndex.execute(input),
  };
}
