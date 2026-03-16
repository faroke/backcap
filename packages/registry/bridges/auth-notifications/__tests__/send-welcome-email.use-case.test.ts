import { describe, it, expect, vi } from "vitest";
import { SendWelcomeEmailUseCase } from "../use-cases/send-welcome-email.use-case.js";
import { UserRegistered } from "../domain/events/user-registered.event.js";
import { SendWelcomeEmailError } from "../errors/send-welcome-email.error.js";

describe("SendWelcomeEmailUseCase", () => {
  const mockEmailSender = {
    sendEmail: vi.fn(),
  };

  const event = new UserRegistered({
    userId: "u-1",
    email: "test@example.com",
    occurredAt: new Date("2025-06-01T12:00:00Z"),
  });

  it("returns ok when email sends successfully", async () => {
    mockEmailSender.sendEmail.mockResolvedValue(undefined);
    const useCase = new SendWelcomeEmailUseCase(mockEmailSender);

    const result = await useCase.execute(event);

    expect(result.isOk()).toBe(true);
    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith({
      recipientEmail: "test@example.com",
      userId: "u-1",
      occurredAt: event.occurredAt,
    });
  });

  it("returns fail with SendWelcomeEmailError when email throws", async () => {
    const smtpError = new Error("smtp failure");
    mockEmailSender.sendEmail.mockRejectedValue(smtpError);
    const useCase = new SendWelcomeEmailUseCase(mockEmailSender);

    const result = await useCase.execute(event);

    expect(result.isFail()).toBe(true);
    const error = result.unwrapError();
    expect(error).toBeInstanceOf(SendWelcomeEmailError);
    expect(error.cause).toBe(smtpError);
  });

  it("maps occurredAt from event to DTO", async () => {
    mockEmailSender.sendEmail.mockResolvedValue(undefined);
    const useCase = new SendWelcomeEmailUseCase(mockEmailSender);

    await useCase.execute(event);

    const dto = mockEmailSender.sendEmail.mock.calls[0]![0];
    expect(dto.occurredAt).toEqual(new Date("2025-06-01T12:00:00Z"));
  });
});
