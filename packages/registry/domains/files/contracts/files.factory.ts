import type { IFileStorage } from "../application/ports/file-storage.port.js";
import type { IFileProcessor } from "../application/ports/file-processor.port.js";
import { UploadFile } from "../application/use-cases/upload-file.use-case.js";
import { GetFile } from "../application/use-cases/get-file.use-case.js";
import { DeleteFile } from "../application/use-cases/delete-file.use-case.js";
import { ProcessFile } from "../application/use-cases/process-file.use-case.js";
import { ListFiles } from "../application/use-cases/list-files.use-case.js";
import { GetFileUrl } from "../application/use-cases/get-file-url.use-case.js";
import type { IFilesService } from "./files.contract.js";

export type FilesServiceDeps = {
  fileStorage: IFileStorage;
  fileProcessor: IFileProcessor;
};

export function createFilesService(deps: FilesServiceDeps): IFilesService {
  const uploadFile = new UploadFile(deps.fileStorage);
  const getFile = new GetFile(deps.fileStorage);
  const deleteFile = new DeleteFile(deps.fileStorage);
  const processFile = new ProcessFile(deps.fileStorage, deps.fileProcessor);
  const listFiles = new ListFiles(deps.fileStorage);
  const getFileUrl = new GetFileUrl(deps.fileStorage);

  return {
    upload: async (input) => {
      const result = await uploadFile.execute(input);
      return result.map(({ output }) => output);
    },
    get: (input) => getFile.execute(input),
    delete: (input) => deleteFile.execute(input),
    process: (input) => processFile.execute(input),
    list: (input) => listFiles.execute(input),
    getUrl: (input) => getFileUrl.execute(input),
  };
}
