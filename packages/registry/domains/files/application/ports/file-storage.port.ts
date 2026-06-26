import type { File } from "../../domain/entities/file.entity.js";

export interface FindAllOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface IFileStorage {
  save(file: File): Promise<void>;
  findById(fileId: string): Promise<File | null>;
  findAll(options?: FindAllOptions): Promise<File[]>;
  delete(fileId: string): Promise<void>;
  upload(key: string, data: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  getUrl(key: string): Promise<string>;
}
