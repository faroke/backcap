import { describe, it, expect, beforeEach } from "vitest";
import { RegisterWebhook } from "../use-cases/register-webhook.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/webhook-repository.mock.js";

describe("RegisterWebhook use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let registerWebhook: RegisterWebhook;

  beforeEach(() => {
    webhookRepo = new InMemoryWebhookRepository();
    registerWebhook = new RegisterWebhook(webhookRepo);
  });

  it("registers a webhook successfully", async () => {
    const result = await registerWebhook.execute({
      url: "https://example.com/hook",
      events: ["user.created"],
      secret: "s3cret",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.webhookId).toBeDefined();

    const saved = await webhookRepo.findById(output.webhookId);
    expect(saved).not.toBeNull();
    expect(saved!.url.value).toBe("https://example.com/hook");
  });

  it("rejects invalid URL", async () => {
    const result = await registerWebhook.execute({
      url: "not-a-url",
      events: ["user.created"],
      secret: "s3cret",
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects empty events array", async () => {
    const result = await registerWebhook.execute({
      url: "https://example.com/hook",
      events: [],
      secret: "s3cret",
    });

    expect(result.isFail()).toBe(true);
  });
});
