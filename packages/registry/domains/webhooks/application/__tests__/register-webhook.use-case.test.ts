import { describe, it, expect, beforeEach } from "vitest";
import { RegisterWebhook } from "../use-cases/register-webhook.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/in-memory-webhook-repository.mock.js";
import { InMemoryWebhookDelivery } from "./mocks/in-memory-webhook-delivery.mock.js";
import { InvalidWebhookUrl } from "../../domain/errors/invalid-webhook-url.error.js";

describe("RegisterWebhook use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let webhookDelivery: InMemoryWebhookDelivery;
  let registerWebhook: RegisterWebhook;

  beforeEach(() => {
    webhookRepo = new InMemoryWebhookRepository();
    webhookDelivery = new InMemoryWebhookDelivery();
    registerWebhook = new RegisterWebhook(webhookRepo, webhookDelivery);
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
    expect(output.createdAt).toBeInstanceOf(Date);

    const saved = await webhookRepo.findById(output.webhookId);
    expect(saved).toBeDefined();
    expect(saved!.url.value).toBe("https://example.com/hook");
  });

  it("rejects invalid URL", async () => {
    const result = await registerWebhook.execute({
      url: "not-a-url",
      events: ["user.created"],
      secret: "s3cret",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
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
