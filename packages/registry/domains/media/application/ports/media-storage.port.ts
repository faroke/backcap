export interface IMediaStorage {
  upload(key: string, data: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}
