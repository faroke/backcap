import { describe, it, expect } from "vitest";
import { FormSubmitted } from "../events/form-submitted.event.js";

describe("FormSubmitted domain event", () => {
  it("creates an event with default occurredAt", () => {
    const event = new FormSubmitted("form-1", "sub-1");
    expect(event.formId).toBe("form-1");
    expect(event.submissionId).toBe("sub-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates an event with explicit occurredAt", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const event = new FormSubmitted("form-1", "sub-1", date);
    expect(event.occurredAt).toBe(date);
  });
});
