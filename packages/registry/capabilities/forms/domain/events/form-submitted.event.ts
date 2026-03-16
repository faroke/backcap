export class FormSubmitted {
  public readonly formId: string;
  public readonly submissionId: string;
  public readonly occurredAt: Date;

  constructor(
    formId: string,
    submissionId: string,
    occurredAt: Date = new Date(),
  ) {
    this.formId = formId;
    this.submissionId = submissionId;
    this.occurredAt = occurredAt;
  }
}
