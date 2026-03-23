import type { Form } from "../../../domain/entities/form.entity.js";
import type { IFormStore } from "../../ports/form-store.port.js";

export class InMemoryFormStore implements IFormStore {
  private forms = new Map<string, Form>();
  private submissions = new Map<
    string,
    Array<{ submissionId: string; data: Record<string, unknown>; submittedAt: Date }>
  >();

  async saveForm(form: Form): Promise<void> {
    this.forms.set(form.id, form);
  }

  async findFormById(id: string): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async saveSubmission(
    formId: string,
    data: Record<string, unknown>,
  ): Promise<{ submissionId: string }> {
    const submissionId = crypto.randomUUID();
    const list = this.submissions.get(formId) ?? [];
    list.push({ submissionId, data, submittedAt: new Date() });
    this.submissions.set(formId, list);
    return { submissionId };
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
    const list = this.submissions.get(formId) ?? [];
    return {
      submissions: list.slice(pagination.offset, pagination.offset + pagination.limit),
      total: list.length,
    };
  }
}
