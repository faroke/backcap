export type {
  IndexDocumentInput,
  IndexDocumentOutput,
  SearchDocumentsInput,
  SearchDocumentsOutput,
  RemoveFromIndexInput,
  RemoveFromIndexOutput,
  ISearchService,
} from "./search.contract.js";

export { createSearchService } from "./search.factory.js";
export type { SearchServiceDeps } from "./search.factory.js";
