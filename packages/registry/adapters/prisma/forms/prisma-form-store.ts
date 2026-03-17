import type { IFormStore } from "../../../capabilities/forms/application/ports/form-store.port.js";
import { Form } from "../../../capabilities/forms/domain/entities/form.entity.js";
import { FormField, type FormFieldType } from "../../../capabilities/forms/domain/value-objects/form-field.vo.js";

interface PrismaFormRecord {
  id: string;
  name: string;
  fields: unknown;
  createdAt: Date;
}

interface PrismaFormSubmission {
  id: string;
  formId: string;
  data: unknown;
  submittedAt: Date;
}

interface PrismaFormDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaFormRecord | null>;
  create(args: { data: PrismaFormRecord }): Promise<PrismaFormRecord>;
  upsert(args: {
    where: { id: string };
    create: PrismaFormRecord;
    update: Partial<PrismaFormRecord>;
  }): Promise<PrismaFormRecord>;
}

interface PrismaFormSubmissionDelegate {
  create(args: { data: Omit<PrismaFormSubmission, "id"> & { id?: string } }): Promise<PrismaFormSubmission>;
  findMany(args: {
    where: { formId: string };
    skip?: number;
    take?: number;
  }): Promise<PrismaFormSubmission[]>;
  count(args: { where: { formId: string } }): Promise<number>;
}

interface PrismaClient {
  formRecord: PrismaFormDelegate;
  formSubmission: PrismaFormSubmissionDelegate;
}

export class PrismaFormStore implements IFormStore {
  constructor(private readonly prisma: PrismaClient) {}

  async saveForm(form: Form): Promise<void> {
    const data: PrismaFormRecord = {
      id: form.id,
      name: form.name,
      fields: form.fields.map((f) => ({
        name: f.name,
        type: f.type,
        required: f.required,
        options: f.options,
      })),
      createdAt: form.createdAt,
    };
    await this.prisma.formRecord.upsert({
      where: { id: form.id },
      create: data,
      update: data,
    });
  }

  async findFormById(id: string): Promise<Form | undefined> {
    const record = await this.prisma.formRecord.findUnique({ where: { id } });
    if (!record) return undefined;
    return this.toDomain(record);
  }

  async saveSubmission(
    formId: string,
    data: Record<string, unknown>,
  ): Promise<{ submissionId: string }> {
    const submission = await this.prisma.formSubmission.create({
      data: { formId, data, submittedAt: new Date() },
    });
    return { submissionId: submission.id };
  }

  async getSubmissions(
    formId: string,
    pagination: { limit: number; offset: number },
  ): Promise<{
    submissions: Array<{
      submissionId: string;
      data: Record<string, unknown>;
      submittedAt: Date;
    }>;
    total: number;
  }> {
    const [records, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where: { formId },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      this.prisma.formSubmission.count({ where: { formId } }),
    ]);

    return {
      submissions: records.map((r) => ({
        submissionId: r.id,
        data: r.data as Record<string, unknown>,
        submittedAt: r.submittedAt,
      })),
      total,
    };
  }

  private toDomain(record: PrismaFormRecord): Form {
    const rawFields = record.fields as Array<{
      name: string;
      type: FormFieldType;
      required: boolean;
      options?: string[];
    }>;
    const fields: FormField[] = [];
    for (const f of rawFields) {
      const fieldResult = FormField.create(f);
      if (fieldResult.isFail()) {
        throw new Error(`Corrupted form field in record ${record.id}: ${fieldResult.unwrapError().message}`);
      }
      fields.push(fieldResult.unwrap());
    }
    const formResult = Form.create({
      id: record.id,
      name: record.name,
      fields,
      createdAt: record.createdAt,
    });
    if (formResult.isFail()) {
      throw new Error(`Corrupted form record ${record.id}: ${formResult.unwrapError().message}`);
    }
    return formResult.unwrap();
  }
}
