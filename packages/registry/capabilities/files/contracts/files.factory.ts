import type { IFileStorage } from "../application/ports/file-storage.port.js";
import { UploadFile } from "../application/use-cases/upload-file.use-case.js";
import { GetFile } from "../application/use-cases/get-file.use-case.js";
import { DeleteFile } from "../application/use-cases/delete-file.use-case.js";
import type { IFilesService } from "./files.contract.js";

export type FilesServiceDeps = {
  fileStorage: IFileStorage;
};

export function createFilesService(deps: FilesServiceDeps): IFilesService {
  const uploadFile = new UploadFile(deps.fileStorage);
  const getFile = new GetFile(deps.fileStorage);
  const deleteFile = new DeleteFile(deps.fileStorage);

  return {
    upload: async (input) => {
      const result = await uploadFile.execute(input);
      if (result.isFail()) {
        return result;
      }
      return result.map(({ output }) => output);
    },
    get: (input) => getFile.execute(input),
    delete: (input) => deleteFile.execute(input),
  };
}
