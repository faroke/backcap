import type { Result } from "../shared/result.js";
import type { IndexDocumentInput, IndexDocumentOutput } from "../application/dto/index-document.dto.js";
import type { SearchDocumentsInput, SearchDocumentsOutput } from "../application/dto/search-documents.dto.js";
import type { RemoveFromIndexInput, RemoveFromIndexOutput } from "../application/dto/remove-from-index.dto.js";

export type { IndexDocumentInput, IndexDocumentOutput };
export type { SearchDocumentsInput, SearchDocumentsOutput };
export type { RemoveFromIndexInput, RemoveFromIndexOutput };

export interface ISearchService {
  indexDocument(input: IndexDocumentInput): Promise<Result<IndexDocumentOutput, Error>>;
  searchDocuments(input: SearchDocumentsInput): Promise<Result<SearchDocumentsOutput, Error>>;
  removeFromIndex(input: RemoveFromIndexInput): Promise<Result<RemoveFromIndexOutput, Error>>;
}
