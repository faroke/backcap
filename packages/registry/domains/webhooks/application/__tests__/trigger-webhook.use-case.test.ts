import { describe, it, expect, beforeEach } from "vitest";
import { TriggerWebhook } from "../use-cases/trigger-webhook.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/in-memory-webhook-repository.mock.js";
import { InMemoryWebhookDelivery } from "./mocks/in-memory-webhook-delivery.mock.js";
import { createTestWebhook } from "./fixtures/webhook.fixture.js";
import { WebhookNotFound } from "../../domain/errors/webhook-not-found.error.js";
import { WebhookDeliveryFailed } from "../../domain/errors/webhook-delivery-failed.error.js";

describe("TriggerWebhook use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let webhookDelivery: InMemoryWebhookDelivery;
  let triggerWebhook: TriggerWebhook;

  beforeEach(async () => {
    webhookRepo = new InMemoryWebhookRepository();
    webhookDelivery = new InMemoryWebhookDelivery();
    triggerWebhook = new TriggerWebhook(webhookRepo, webhookDelivery);

    await webhookRepo.save(
      createTestWebhook({ id: "wh-1", events: ["user.created"] }),
    );
  });

  it("delivers successfully", async () => {
    const result = await triggerWebhook.execute({
      webhookId: "wh-1",
      eventType: "user.created",
      payload: { userId: "123" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.statusCode).toBe(200);
    expect(output.deliveredAt).toBeInstanceOf(Date);
    expect(webhookDelivery.deliveries).toHaveLength(1);
    expect(webhookDelivery.deliveries[0].secret).toBe("test-secret");
  });

  it("returns WebhookNotFound for unknown webhook", async () => {
    const result = await triggerWebhook.execute({
      webhookId: "unknown",
      eventType: "user.created",
      payload: {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(WebhookNotFound);
  });

  it("returns WebhookDeliveryFailed on 4xx/5xx status", async () => {
    webhookDelivery.statusCode = 500;

    const result = await triggerWebhook.execute({
      webhookId: "wh-1",
      eventType: "user.created",
      payload: { userId: "123" },
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(WebhookDeliveryFailed);
  });

  it("returns WebhookDeliveryFailed for non-subscribed event type", async () => {
    const result = await triggerWebhook.execute({
      webhookId: "wh-1",
      eventType: "order.completed",
      payload: {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(WebhookDeliveryFailed);
    expect(webhookDelivery.deliveries).toHaveLength(0);
  });

  it("returns WebhookDeliveryFailed for inactive webhook", async () => {
    const inactive = createTestWebhook({ id: "wh-inactive", isActive: false });
    await webhookRepo.save(inactive);

    const result = await triggerWebhook.execute({
      webhookId: "wh-inactive",
      eventType: "user.created",
      payload: {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(WebhookDeliveryFailed);
  });
});
