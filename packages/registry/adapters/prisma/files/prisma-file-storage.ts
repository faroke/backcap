// Template: import type { IFileStorage } from "{{capabilities_path}}/files/application/ports/file-storage.port";
import type { IFileStorage } from "../../../capabilities/files/application/ports/file-storage.port.js";
import { File } from "../../../capabilities/files/domain/entities/file.entity.js";

interface PrismaFileRecord {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

interface PrismaFileDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaFileRecord | null>;
  upsert(args: {
    where: { id: string };
    create: PrismaFileRecord;
    update: Partial<PrismaFileRecord>;
  }): Promise<PrismaFileRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaFileRecord>;
}

interface PrismaClient {
  fileRecord: PrismaFileDelegate;
}

export class PrismaFileStorage implements IFileStorage {
  constructor(private readonly prisma: PrismaClient) {}

  async save(file: File): Promise<void> {
    const data = this.toPrisma(file);
    await this.prisma.fileRecord.upsert({
      where: { id: file.id },
      create: data,
      update: data,
    });
  }

  async findById(fileId: string): Promise<File | null> {
    const record = await this.prisma.fileRecord.findUnique({ where: { id: fileId } });
    return record ? this.toDomain(record) : null;
  }

  async delete(fileId: string): Promise<void> {
    await this.prisma.fileRecord.delete({ where: { id: fileId } });
  }

  private toDomain(record: PrismaFileRecord): File {
    const result = File.create({
      id: record.id,
      name: record.name,
      path: record.path,
      mimeType: record.mimeType,
      size: record.size,
      uploadedAt: record.uploadedAt,
    });
    // Data from DB is trusted; unwrap safely
    return result.unwrap();
  }

  private toPrisma(file: File): PrismaFileRecord {
    return {
      id: file.id,
      name: file.name,
      path: file.path.value,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
    };
  }
}
