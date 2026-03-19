// Template: import type { IJobRepository } from "{{cap_rel}}/queues/application/ports/job-repository.port.js";
import type { IJobRepository } from "../../../capabilities/queues/application/ports/job-repository.port.js";
// Template: import { Job } from "{{cap_rel}}/queues/domain/entities/job.entity.js";
import { Job } from "../../../capabilities/queues/domain/entities/job.entity.js";
// Template: import type { JobStatus } from "{{cap_rel}}/queues/domain/entities/job.entity.js";
import type { JobStatus } from "../../../capabilities/queues/domain/entities/job.entity.js";

interface PrismaJobRecord {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  scheduledAt: Date;
  createdAt: Date;
  failureReason: string | null;
}

interface PrismaJobDelegate {
  findUnique(args: {
    where: { id: string };
  }): Promise<PrismaJobRecord | null>;
  findMany(args?: {
    where?: { type?: string; status?: string };
  }): Promise<PrismaJobRecord[]>;
  upsert(args: {
    where: { id: string };
    create: PrismaJobRecord;
    update: Partial<PrismaJobRecord>;
  }): Promise<PrismaJobRecord>;
}

interface PrismaClient {
  jobRecord: PrismaJobDelegate;
}

export class PrismaJobRepository implements IJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(job: Job): Promise<void> {
    const data = this.toPrisma(job);
    await this.prisma.jobRecord.upsert({
      where: { id: job.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Job | undefined> {
    const record = await this.prisma.jobRecord.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : undefined;
  }

  async findPending(type: string): Promise<Job[]> {
    const records = await this.prisma.jobRecord.findMany({
      where: { type, status: "pending" },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaJobRecord): Job {
    const result = Job.create({
      id: record.id,
      type: record.type,
      payload: record.payload,
      status: record.status as JobStatus,
      attempts: record.attempts,
      scheduledAt: record.scheduledAt,
      createdAt: record.createdAt,
      failureReason: record.failureReason ?? undefined,
    });
    if (result.isFail()) {
      throw new Error(`Corrupted job record ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  private toPrisma(job: Job): PrismaJobRecord {
    return {
      id: job.id,
      type: job.type,
      payload: job.payload.value,
      status: job.status,
      attempts: job.attempts,
      scheduledAt: job.scheduledAt,
      createdAt: job.createdAt,
      failureReason: job.failureReason ?? null,
    };
  }
}
