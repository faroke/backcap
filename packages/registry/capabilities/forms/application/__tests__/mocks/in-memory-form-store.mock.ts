import type { Form } from "../../../domain/entities/form.entity.js";
import type { IFormStore, FormSubmission } from "../../ports/form-store.port.js";

export class InMemoryFormStore implements IFormStore {
  private forms = new Map<string, Form>();
  private submissions: FormSubmission[] = [];

  async saveForm(form: Form): Promise<void> {
    this.forms.set(form.id, form);
  }

  async findFormById(id: string): Promise<Form | null> {
    return this.forms.get(id) ?? null;
  }

  async saveSubmission(submission: FormSubmission): Promise<void> {
    this.submissions.push(submission);
  }

  async getSubmissions(formId: string): Promise<FormSubmission[]> {
    return this.submissions.filter((s) => s.formId === formId);
  }
}
